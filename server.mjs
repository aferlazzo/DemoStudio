import http from 'node:http';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const root=join(dirname(fileURLToPath(import.meta.url)),'public');
const port=Number(process.env.PORT||4317);
const allowed=new Map([['/','index.html'],['/app.js','app.js'],['/core.js','core.js'],['/guide.js','guide.js'],['/style.css','style.css']]);
const server=http.createServer(async(req,res)=>{
  const origin=`http://127.0.0.1:${port}`;
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.headers.host!==`127.0.0.1:${port}`&&req.headers.host!==`localhost:${port}`){res.writeHead(403);res.end('Local access only');return;}
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
        const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-i',input,'-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',output],{windowsHide:true});
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
  console.log(`Demo Studio: ${url}`);
  if(process.argv.includes('--open')&&process.platform==='win32'){
    const browser=spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,detached:true,stdio:'ignore'});
    browser.on('error',()=>console.log(`Open ${url} in Chrome or Edge.`));
    browser.unref();
  }
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
