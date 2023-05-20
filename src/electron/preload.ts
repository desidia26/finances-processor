import {
  // nativeImage
  contextBridge, ipcRenderer
} from "electron";

contextBridge.exposeInMainWorld(
  "electronStore", {
    // @ts-ignore
    get: (key) => ipcRenderer.invoke('electron-store-get', key),
    // @ts-ignore
    set: (key, value) => ipcRenderer.invoke('electron-store-set', { key, value }),
  },
);

contextBridge.exposeInMainWorld("eventListener", {
  // @ts-ignore
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

