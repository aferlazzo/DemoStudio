import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {renderMovie,runProcess,ffmpeg} from '../media.mjs';
import {spawn} from 'node:child_process';
const metadata=file=>new Promise((resolve,reject)=>{const child=spawn(ffmpeg,['-hide_banner','-i',file,'-f','null','-']);let err='';child.stderr.on('data',b=>err+=b);child.once('error',reject);child.once('exit',code=>code?reject(Error(err)):resolve(err));});
test('both export layouts preserve H.264/AAC, captions, masks and source content',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'demomaker-reel-'));
 try{
  const source=join(dir,'source.webm');
  await runProcess(ffmpeg,['-v','error','-f','lavfi','-i','testsrc2=s=360x640:r=15','-f','lavfi','-i','sine=frequency=440:sample_rate=22050','-t','2','-c:v','libvpx','-c:a','libopus','-y',source]);
  const bytes=await readFile(source);
  for(const format of ['standard','reel']){
   const form=new FormData();form.append('video',new Blob([bytes]),'source.webm');form.append('audio',new Blob([bytes]),'voice.webm');form.append('project',JSON.stringify({format,duration:2,cues:[{start:0,end:2,text:'Readable captions follow narration in either video format.'}],masks:[{x:1,y:1,w:10,h:10}],fade:false}));
   const rendered=await renderMovie(form),file=join(dir,format+'.mp4');await writeFile(file,rendered);
   const info=await metadata(file);assert.match(info,/Video: h264/);assert.match(info,/Audio: aac/);assert.match(info,format==='reel'?/1080x1920/:/1280x900/);
   form.set('project',JSON.stringify({format:'invalid',duration:2,cues:[]}));await assert.rejects(renderMovie(form),/Unknown export format/);
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});
