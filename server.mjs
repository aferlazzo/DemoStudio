import {readBody,narrate,renderMovie,speechReady,runProcess} from './media.mjs';
import http from 'node:http';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const root=join(dirname(fileURLToPath(import.meta.url)),'public');
const port=Number(process.env.PORT||4317);
const allowed=new Map([['/','index.html'],['/app.js','app.js'],['/core.js','core.js'],['/guide.js','guide.js'],['/narration.js','narration.js'],['/style.css','style.css']]);
const server=http.createServer(async(req,res)=>{
  const origin=`http://127.0.0.1:${port}`;
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.headers.host!==`127.0.0.1:${port}`&&req.headers.host!==`localhost:${port}`){res.writeHead(403);res.end('Local access only');return;}
  if(req.method==='GET'&&req.url==='/demos'){res.writeHead(302,{Location:'/demos/'});res.end();return;}
  const demoPath=(req.url||'').split('?')[0].replace(/^\/demos\/$/,'/demos/index.html');
  const demoFiles=new Map([['/demos/index.html','index.html'],['/demos/media/SoHelpMe-Demo.mp4','media/SoHelpMe-Demo.mp4'],['/demos/media/DemoStudio-Demo.mp4','media/DemoStudio-Demo.mp4'],['/demos/media/SoHelpMe-Demo.srt','media/SoHelpMe-Demo.srt'],['/demos/media/DemoStudio-Demo.srt','media/DemoStudio-Demo.srt']]);
  if(req.method==='GET'&&demoFiles.has(demoPath)){
    try{const file=demoFiles.get(demoPath),data=await readFile(join(root,'../docs',file));const headers={'Content-Type':file.endsWith('.mp4')?'video/mp4':file.endsWith('.srt')?'text/plain; charset=utf-8':'text/html; charset=utf-8','Accept-Ranges':'bytes'};
      if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range),start=Number(match?.[1]),end=match?.[2]?Number(match[2]):data.length-1;if(!match||start>end||start>=data.length||end>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}const part=data.subarray(start,end+1);res.writeHead(206,{...headers,'Content-Length':part.length,'Content-Range':`bytes ${start}-${end}/${data.length}`});res.end(part);return;}
      res.writeHead(200,{...headers,'Content-Length':data.length});res.end(data);
    }catch{res.writeHead(404);res.end('Demo file not available. Watch the published videos at https://aferlazzo.github.io/demoMaker/');}return;
  }
  if(req.method==='GET'&&req.url==='/narration/status'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ready:await speechReady()}));return;}
  if(req.method==='POST'&&['/narration','/narration/setup','/render'].includes(req.url)){
    if(![origin,`http://localhost:${port}`].includes(req.headers.origin)){res.writeHead(403);res.end('Invalid origin');return;}
    try{
      if(req.url==='/narration/setup'){await runProcess('powershell.exe',['-NoProfile','-File',join(root,'../scripts/setup-speech.ps1')],{timeout:600000});res.writeHead(200);res.end('Ready');}
      else if(req.url==='/narration'){const result=await narrate(JSON.parse((await readBody(req,150000)).toString('utf8')));res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(result));}
      else{const form=await new Response(await readBody(req),{headers:{'Content-Type':req.headers['content-type']||''}}).formData();const movie=await renderMovie(form);res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':movie.length});res.end(movie);}
    }catch(e){res.writeHead(400,{'Content-Type':'text/plain'});res.end(e.message);}
    return;
  }
  if(req.method==='POST'&&req.url==='/convert'){
    if(![origin,`http://localhost:${port}`].includes(req.headers.origin)){res.writeHead(403);res.end('Invalid origin');return;}
    let dir;
    try{
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>300*1024*1024)throw new Error('Recording exceeds 300 MB. Use a shorter recording.');chunks.push(chunk);}
      if(!size)throw new Error('Recording is empty.');
      dir=await mkdtemp(join(tmpdir(),'demo-studio-'));
      const input=join(dir,'capture.webm'),output=join(dir,'demo.mp4');
      await writeFile(input,Buffer.concat(chunks));
      await new Promise((resolve,reject)=>{
        const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-i',input,'-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',output],{windowsHide:true});
        let err='';const timeout=setTimeout(()=>{child.kill();reject(new Error('Conversion timed out after five minutes.'));},300000);
        child.stderr.on('data',b=>{err=(err+b.toString()).slice(-3000);});
        child.on('error',e=>{clearTimeout(timeout);reject(e);});
        child.on('exit',code=>{clearTimeout(timeout);code===0?resolve():reject(new Error('Video conversion failed. '+err));});
      });
      const data=await readFile(output);res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':data.length});res.end(data);
    }catch(e){res.writeHead(400,{'Content-Type':'text/plain'});res.end(e.message);}
    finally{if(dir)await rm(dir,{recursive:true,force:true});}
    return;
  }
  if(req.method!=='GET'||!allowed.has(req.url)){res.writeHead(404);res.end('Not found');return;}
  try{const file=allowed.get(req.url);const type=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html';res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(join(root,file)));}catch{res.writeHead(500);res.end('Unable to load file');}
});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${port}`;
  console.log(`demoMaker: ${url}`);
  if(process.argv.includes('--open')&&process.platform==='win32'){
    const browser=spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,detached:true,stdio:'ignore'});
    browser.on('error',()=>console.log(`Open ${url} in Chrome or Edge.`));
    browser.unref();
  }
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
