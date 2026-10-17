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
    const rejected=await fetch(origin+'/convert',{method:'POST',headers:{Origin:'https://example.org'},body:'bad'});assert.equal(rejected.status,403);
    const input=join(dir,'codec-test.webm'),output=join(dir,'codec-test.mp4');
    await run(['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=green:s=320x180:r=15','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','1','-c:v','libvpx','-c:a','libopus','-y',input]);
    const response=await fetch(origin+'/convert',{method:'POST',headers:{Origin:origin,'Content-Type':'application/octet-stream'},body:await readFile(input)});assert.equal(response.status,200,await response.clone().text());assert.equal(response.headers.get('content-type'),'video/mp4');
    const data=Buffer.from(await response.arrayBuffer());assert.equal(data.subarray(4,8).toString(),'ftyp');await writeFile(output,data);
    const metadata=await run(['-hide_banner','-i',output,'-f','null','-']);assert.match(metadata,/Video: h264/);assert.match(metadata,/Audio: aac/);
  }finally{server.kill();await rm(dir,{recursive:true,force:true});}
});
