// Electronのpreloadスクリプト
// 必要に応じてwindowオブジェクトへAPIを公開 

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: {
    invoke: (...args) => ipcRenderer.invoke(...args),
    on: (...args) => ipcRenderer.on(...args),
  }
}); 