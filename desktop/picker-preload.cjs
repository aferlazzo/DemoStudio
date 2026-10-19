const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('capture',{sources:()=>ipcRenderer.invoke('capture:sources'),select:id=>ipcRenderer.send('capture:select',id)});
