const {app,BrowserWindow,desktopCapturer,session,ipcMain,dialog,shell}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
let mainWindow,picker,server,origin,selection;
app.setName('demoMaker');
if(!app.requestSingleInstanceLock())app.quit();
else {
app.on('second-instance',()=>{if(mainWindow){mainWindow.restore();mainWindow.focus();}});
app.whenReady().then(async()=>{
  if(app.isPackaged){
    process.env.DEMOMAKER_SPEECH_ROOT=path.join(process.resourcesPath,'speech');
    process.env.DEMOMAKER_NARRATE_SCRIPT=path.join(process.resourcesPath,'scripts/narrate.py');
  }
  process.env.PORT='0';
  ({server}=await import('../server.mjs'));
  if(!server.listening)await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  origin=`http://127.0.0.1:${server.address().port}`;
  mainWindow=new BrowserWindow({width:1400,height:960,minWidth:900,minHeight:650,title:'demoMaker',webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
  mainWindow.setMenuBarVisibility(false);
  const local=url=>{try{return new URL(url).origin===origin;}catch{return false;}};
  session.defaultSession.setPermissionCheckHandler((wc,permission,requestOrigin)=>wc===mainWindow.webContents&&local(requestOrigin)&&['media','display-capture'].includes(permission));
  session.defaultSession.setPermissionRequestHandler(async(wc,permission,callback)=>{
    if(wc!==mainWindow.webContents||!local(wc.getURL())||permission!=='media')return callback(false);
    const result=await dialog.showMessageBox(mainWindow,{type:'question',buttons:['Allow microphone','Cancel'],defaultId:1,cancelId:1,message:'Allow demoMaker to record your microphone?'});callback(result.response===0);
  });
  ipcMain.handle('capture:sources',async event=>{
    if(event.sender!==picker?.webContents)throw Error('Invalid capture picker');
    const sources=await desktopCapturer.getSources({types:['window','screen'],thumbnailSize:{width:240,height:135}});
    selection=sources.filter(s=>s.name!=='Choose a screen — demoMaker');
    return selection.map(s=>({id:s.id,name:s.name,thumbnail:s.thumbnail.toDataURL()}));
  });
  ipcMain.on('capture:select',(event,id)=>{if(event.sender===picker?.webContents){picker.selectedSource=selection?.find(s=>s.id===id);picker.close();}});
  session.defaultSession.setDisplayMediaRequestHandler((request,callback)=>{
    if(!local(request.securityOrigin)||picker)return callback({});
    picker=new BrowserWindow({parent:mainWindow,modal:true,width:850,height:650,title:'Choose a screen — demoMaker',webPreferences:{preload:path.join(__dirname,'picker-preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
    picker.setMenuBarVisibility(false);
    picker.on('closed',()=>{const source=picker.selectedSource;picker=null;selection=null;callback(source?{video:source,...(request.audioRequested?{audio:'loopback'}:{})}:{});});
    picker.loadFile(path.join(__dirname,'picker.html'));
  });
  mainWindow.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return {action:'deny'};});
  mainWindow.webContents.on('will-navigate',(event,url)=>{if(!local(url))event.preventDefault();});
  session.defaultSession.on('will-download',(_event,item)=>{
    const result=dialog.showSaveDialogSync(mainWindow,{defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});
    if(result)item.setSavePath(result);else item.cancel();
  });
  await mainWindow.loadURL(origin);
  if(process.env.DEMOMAKER_SMOKE_DIR){
    try{const report=await require('./smoke.cjs').run(mainWindow,origin,process.env.DEMOMAKER_SMOKE_DIR);await fs.writeFile(path.join(process.env.DEMOMAKER_SMOKE_DIR,'installed-report.json'),JSON.stringify(report,null,2));app.exit(0);}
    catch(error){await fs.writeFile(path.join(process.env.DEMOMAKER_SMOKE_DIR,'installed-error.txt'),error.stack);app.exit(1);}
  }
}).catch(error=>{dialog.showErrorBox('demoMaker could not start',error.message);app.quit();});
app.on('window-all-closed',()=>{server?.close();app.quit();});
}
