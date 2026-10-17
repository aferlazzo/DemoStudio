import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ffmpeg from 'ffmpeg-static';
const run=args=>new Promise((resolve,reject)=>{const p=spawn(ffmpeg,args,{windowsHide:true});let err='';p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('exit',code=>code===0?resolve(err):reject(new Error(err)));});
test('local server converts a generated codec test clip to playable H.264/AAC MP4 and rejects foreign origins',async()=>{
  const port=4391,origin=`http://127.0.0.1:${port}`;
  const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},windowsHide:true});
  const dir=await mkdtemp(join(tmpdir(),'demo-studio-test-'));
  try{
    await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Server exited '+code)));});
    assert.equal((await fetch(origin)).status,200);
    assert.match(await (await fetch(origin+'/demos/')).text(),/DemoStudio demonstrates itself/);
    const range=await fetch(origin+'/demos/media/SoHelpMe-Demo.mp4',{headers:{Range:'bytes=0-31'}});assert.equal(range.status,206);const firstBytes=Buffer.from(await range.arrayBuffer());assert.equal(firstBytes.length,32);assert.equal(firstBytes.subarray(4,8).toString(),'ftyp');assert.match(range.headers.get('content-range'),/^bytes 0-31\//);
    assert.equal((await fetch(origin+'/demos/media/SoHelpMe-Demo.mp4',{headers:{Range:'bytes=999999999-'}})).status,416);
    assert.equal((await fetch(origin+'/demos/media/not-a-demo.mp4')).status,404);
    assert.equal((await fetch(origin+'/narration/status')).status,200);
    for(const path of ['/narration','/narration/setup','/render'])assert.equal((await fetch(origin+path,{method:'POST',headers:{Origin:'https://example.org'},body:'bad'})).status,403);
    const rejected=await fetch(origin+'/convert',{method:'POST',headers:{Origin:'https://example.org'},body:'bad'});assert.equal(rejected.status,403);
    const input=join(dir,'codec-test.webm'),output=join(dir,'codec-test.mp4');
    await run(['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=green:s=320x180:r=15','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','1','-c:v','libvpx','-c:a','libopus','-y',input]);
    const response=await fetch(origin+'/convert',{method:'POST',headers:{Origin:origin,'Content-Type':'application/octet-stream'},body:await readFile(input)});assert.equal(response.status,200,await response.clone().text());assert.equal(response.headers.get('content-type'),'video/mp4');
    const data=Buffer.from(await response.arrayBuffer());assert.equal(data.subarray(4,8).toString(),'ftyp');await writeFile(output,data);
    const metadata=await run(['-hide_banner','-i',output,'-f','null','-']);assert.match(metadata,/Video: h264/);assert.match(metadata,/Audio: aac/);
    const form=new FormData();form.append('video',new Blob([await readFile(input)]),'source.webm');form.append('audio',new Blob([await readFile(input)]),'voice.webm');form.append('project',JSON.stringify({duration:1,cues:[{start:0,end:1,text:'Test captions'}],captions:true,fade:true,masks:[],crop:{}}));
    const rendered=await fetch(origin+'/render',{method:'POST',headers:{Origin:origin},body:form});assert.equal(rendered.status,200,await rendered.clone().text());const renderedFile=join(dir,'rendered.mp4');await writeFile(renderedFile,Buffer.from(await rendered.arrayBuffer()));
    const renderedInfo=await run(['-hide_banner','-i',renderedFile,'-f','null','-']);assert.match(renderedInfo,/1280x900/);assert.match(renderedInfo,/Audio: aac/);
    const missingVideo=new FormData();missingVideo.append('project','{}');const invalid=await fetch(origin+'/render',{method:'POST',headers:{Origin:origin},body:missingVideo});assert.equal(invalid.status,400);assert.match(await invalid.text(),/screen recording/);
    form.set('project',JSON.stringify({duration:1,cues:[{start:0,end:3,text:'Beyond end'}]}));const badTimeline=await fetch(origin+'/render',{method:'POST',headers:{Origin:origin},body:form});assert.equal(badTimeline.status,400);assert.match(await badTimeline.text(),/caption timing/);
  }finally{server.kill();await rm(dir,{recursive:true,force:true});}
});
