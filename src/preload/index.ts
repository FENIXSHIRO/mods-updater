import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  getGameDir: () => ipcRenderer.invoke('get-game-dir'),
  selectGameDir: () => ipcRenderer.invoke('select-folder'),
  checkServerAvailability: () => ipcRenderer.invoke('check-server-availability'),
  compareFiles: (dir) => ipcRenderer.invoke('compare-files', dir),
  downloadManifest: (dir) => ipcRenderer.invoke('download-manifest', dir),
  syncFiles: (dir) => ipcRenderer.invoke('sync-files', dir),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
