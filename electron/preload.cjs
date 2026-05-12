const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  getLogPath: () => ipcRenderer.invoke('get-log-path'),
  log: (tag, message) => ipcRenderer.send('log', tag, message),
  platform: process.platform,
});
