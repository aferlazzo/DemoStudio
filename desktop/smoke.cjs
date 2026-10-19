// Run only in installed-app CI when DEMOMAKER_SMOKE_DIR is supplied.
exports.run=async(window,origin,folder)=>{
  const fs=require('node:fs/promises'),path=require('node:path');
  const {ffmpeg,runProcess}=await import('../media.mjs');
  const ui=await window.webContents.executeJavaScript(`({title:document.title,format:!!document.getElementById('exportFormat'),capture:typeof navigator.mediaDevices.getDisplayMedia})`);
  if(!ui.format||ui.capture!=='function')throw Error('Installed user interface did not initialize');
  const ready=await (await fetch(origin+'/narration/status')).json();if(!ready.ready)throw Error('Bundled speech not ready');
  const response=await fetch(origin+'/narration',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({scenes:[{duration:8,title:'demoMaker installed test',text:'Welcome to demoMaker. Create a clear demonstration, then share your finished video.'}],speed:1})});
  if(!response.ok)throw Error(await response.text());const narration=await response.json();
  const audio=Buffer.from(narration.audio,'base64');if(audio.length<2000)throw Error('Narration missing');
  await fs.writeFile(path.join(folder,'narration.wav'),audio);
  // Exercise the installed Chromium canvas/MediaRecorder path without a fake video file.
  const clip=await window.webContents.executeJavaScript(`(async()=>{const c=document.createElement('canvas');c.width=720;c.height=1000;const ctx=c.getContext('2d');function paint(){ctx.fillStyle='#f2f5ef';ctx.fillRect(0,0,720,1000);ctx.fillStyle='#173f30';ctx.font='bold 48px Arial';ctx.fillText('demoMaker',60,100);ctx.font='32px Arial';['Your app demonstration','1. Show the application','2. Explain the useful part','3. Export your video'].forEach((t,i)=>ctx.fillText(t,60,240+i*140));}paint();const stream=c.captureStream(15);const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});const chunks=[];const done=new Promise(resolve=>recorder.onstop=resolve);recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();const timer=setInterval(paint,65);await new Promise(r=>setTimeout(r,1500));recorder.stop();await done;clearInterval(timer);stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return btoa(binary);})()`);
  const video=Buffer.from(clip,'base64');if(video.length<1000)throw Error('Screen recorder produced no frames');
  const report={ui,narration:{duration:narration.duration,cues:narration.cues},exports:[]};
  for(const format of ['standard','reel']){
    const form=new FormData();form.append('video',new Blob([video]),'capture.webm');form.append('audio',new Blob([audio]),'voice.wav');form.append('project',JSON.stringify({duration:narration.duration,cues:narration.cues,format,captions:true,fade:true}));
    const response=await fetch(origin+'/render',{method:'POST',headers:{Origin:origin},body:form});if(!response.ok)throw Error(await response.text());
    const file=path.join(folder,format+'.mp4');await fs.writeFile(file,Buffer.from(await response.arrayBuffer()));
    await runProcess(ffmpeg,['-hide_banner','-i',file,'-f','null','-']);
    await runProcess(ffmpeg,['-v','error','-i',file,'-frames:v','1','-y',path.join(folder,format+'.png')]);
    report.exports.push({format,file,bytes:(await fs.stat(file)).size,decoded:true});
  }
  const screenshot=await window.webContents.capturePage();await fs.writeFile(path.join(folder,'installed-window.png'),screenshot.toPNG());
  return report;
};
