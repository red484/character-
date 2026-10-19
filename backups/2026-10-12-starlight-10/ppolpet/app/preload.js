const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('ppol', {
  onConfig: (cb) => ipcRenderer.on('config', (_e, cfg) => cb(cfg)),
  onUpdate: (cb) => ipcRenderer.on('pet', (_e, data) => cb(data)),
  dragStart: () => ipcRenderer.send('drag-start'),
  dragEnd: () => ipcRenderer.send('drag-end'),
  menu: () => ipcRenderer.send('menu'),
  dropFile: (file) => {
    const p = webUtils && webUtils.getPathForFile ? webUtils.getPathForFile(file) : file.path;
    if (p) ipcRenderer.send('drop-file', p);
  },
  welcome: (action) => ipcRenderer.send('welcome', action),
});
