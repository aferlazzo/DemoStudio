import {readFile,writeFile,mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import {validateScenes,srt} from './public/core.js';
const root=dirname(fileURLToPath(import.meta.url));
let speechBusy=false;
export async function runProcess(command,args,{input,cwd,timeout=300000}={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{cwd,windowsHide:true,env:{...process.env,OMP_NUM_THREADS:'2'}});let stderr='',stdout='';
    const timer=setTimeout(()=>{child.kill();reject(new Error('This operation took too long. Try a shorter project.'));},timeout);
    child.stdout.on('data',b=>stdout=(stdout+b).slice(-200000));child.stderr.on('data',b=>stderr=(stderr+b).slice(-3000));
    child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('exit',code=>{clearTimeout(timer);code===0?resolve(stdout):reject(new Error(stderr||'Media processing failed.'));});
    child.stdin.on('error',()=>{});child.stdin.end(input);
  });
}
export async function readBody(req,max=300*1024*1024){const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>max)throw new Error('File too large. Use a recording smaller than 300 MB.');chunks.push(c);}return Buffer.concat(chunks);}
export async function speechReady(){try{
  const config=JSON.parse((await readFile(join(root,'.local/speech.json'),'utf8')).replace(/^\uFEFF/,''));
  if(config.engine!=='piper')return false;
  await Promise.all([join(root,'.local/piper-voices/en_US-ljspeech-high.onnx'),join(root,'.local/piper-voices/en_US-ljspeech-high.onnx.json'),join(config.packages,'piper/__init__.py'),config.python].map(p=>access(p)));return true;
}catch{return false;}}
export async function narrate(request){
  if(speechBusy)throw new Error('Narration is already being generated. Please wait.');
  if(!await speechReady())throw new Error('Piper narration is not installed. Run Setup Narration.cmd in the demoMaker folder once, then try again.');
  const scenes=validateScenes(request.scenes);if(!scenes.some(s=>s.text.trim()))throw new Error('Write a narration script in at least one scene first.');
  speechBusy=true;let dir;
  try{dir=await mkdtemp(join(tmpdir(),'demo-narration-'));const config=JSON.parse((await readFile(join(root,'.local/speech.json'),'utf8')).replace(/^\uFEFF/,''));
    await runProcess(config.python,[join(root,'scripts/narrate.py')],{input:JSON.stringify({scenes,voice:request.voice,speed:request.speed,output:dir})});
    const timeline=JSON.parse(await readFile(join(dir,'timeline.json'),'utf8'));return{...timeline,audio:(await readFile(join(dir,'narration.wav'))).toString('base64')};
  }finally{speechBusy=false;if(dir)await rm(dir,{recursive:true,force:true});}
}
export async function renderMovie(form){
  const video=form.get('video'),audio=form.get('audio');if(!video||typeof video.arrayBuffer!=='function')throw new Error('Choose a real screen recording first.');
  const project=JSON.parse(form.get('project')||'{}'),duration=Number(project.duration);
  if(!Number.isFinite(duration)||duration<1||duration>1200)throw new Error('Use a video duration between 1 second and 20 minutes.');
  if(!audio||typeof audio.arrayBuffer!=='function')throw new Error('Generate or import narration before creating the video.');
  const cues=project.cues;if(!Array.isArray(cues)||cues.length>2000)throw new Error('Invalid caption timeline.');
  for(const c of cues)if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.end<=c.start||c.end>duration+.1||typeof c.text!=='string')throw new Error('Invalid caption timing.');
  let dir;try{dir=await mkdtemp(join(tmpdir(),'demo-render-'));await writeFile(join(dir,'source.video'),Buffer.from(await video.arrayBuffer()));await writeFile(join(dir,'voice.audio'),Buffer.from(await audio.arrayBuffer()));
    await writeFile(join(dir,'captions.srt'),srt(cues,duration));
    const crop=project.crop||{};const n=k=>Math.max(0,Math.min(45,Number(crop[k])||0))/100;
    let filters=[`crop=iw*${1-n('left')-n('right')}:ih*${1-n('top')-n('bottom')}:iw*${n('left')}:ih*${n('top')}`,'scale=1280:800:force_original_aspect_ratio=decrease:flags=lanczos','pad=1280:900:(ow-iw)/2:(800-ih)/2:color=0x101715','setsar=1',`tpad=stop_mode=clone:stop_duration=${duration}`];
    for(const m of (project.masks||[]).slice(0,20)){const val=k=>Math.max(0,Math.min(100,Number(m[k])||0))/100;filters.push(`drawbox=x=iw*${val('x')}:y=800*${val('y')}:w=iw*${val('w')}:h=800*${val('h')}:color=black:t=fill`);}
    if(project.captions!==false&&cues.length)filters.push("subtitles=captions.srt:force_style='FontName=Arial,FontSize=12,MarginV=8,Outline=1,Shadow=0,Alignment=2'");
    if(project.fade!==false)filters.push('fade=t=in:st=0:d=0.35',`fade=t=out:st=${Math.max(0,duration-.5)}:d=0.5`);
    await runProcess(ffmpeg,['-hide_banner','-loglevel','error','-i','source.video','-i','voice.audio','-map','0:v:0','-map','1:a:0','-vf',filters.join(','),'-t',String(duration),'-r','30','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','apad','-movflags','+faststart','-y','preview.mp4'],{cwd:dir});
    return await readFile(join(dir,'preview.mp4'));
  }finally{if(dir)await rm(dir,{recursive:true,force:true});}
}
