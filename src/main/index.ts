import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import fs from 'fs/promises';
import crypto from 'crypto';
import axios from 'axios';
import icon from '../../resources/icon.png?asset';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 320,
    height: 460,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle('select-folder', async () => {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return filePaths.length ? filePaths[0] : null;
  });

  ipcMain.handle('check-server-availability', async () => {
    try {
      const response = await axios.get('http://192.168.31.96:21010', { timeout: 5000 });
      if (response.status === 200) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Server unavailable: ${message}` };
    }
  });

  ipcMain.handle('download-manifest', async (_event, dir) => {
    if (!dir) return { error: 'No directory selected' };

    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      const manifest = {};

      await Promise.all(
        files
          .filter((dirent) => dirent.isFile())
          .map(async (dirent) => {
            const filePath = `${dir}/${dirent.name}`;
            const data = await fs.readFile(filePath);
            manifest[dirent.name] = crypto.createHash('sha256').update(data).digest('hex');
          })
      );

      const { filePath } = await dialog.showSaveDialog({
        defaultPath: 'manifest.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (filePath) {
        await fs.writeFile(filePath, JSON.stringify(manifest, null, 2));
        return { success: true, filePath };
      }
      return { error: 'Download cancelled' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to create manifest: ${message}` };
    }
  });

  ipcMain.handle('sync-files', async (_event, dir) => {
    if (!dir) return { error: 'No directory selected' };

    try {
      // Получаем манифест с сервера
      const response = await axios.get('http://192.168.31.96:21010/manifest.json');
      const serverManifest = response.data;

      console.log(serverManifest);

      // Читаем локальные файлы
      const localFiles = await fs.readdir(dir, { withFileTypes: true });
      const localManifest = {};

      // Создаем локальный манифест
      await Promise.all(
        localFiles
          .filter((dirent) => dirent.isFile())
          .map(async (dirent) => {
            const filePath = join(dir, dirent.name);
            const data = await fs.readFile(filePath);
            localManifest[dirent.name] = crypto.createHash('sha256').update(data).digest('hex');
          })
      );

      // Определяем файлы для скачивания и удаления
      const filesToDownload: string[] = [];
      const filesToDelete: string[] = [];

      // Проверяем, какие файлы нужно скачать
      for (const [fileName, serverHash] of Object.entries(serverManifest)) {
        if (!localManifest[fileName] || localManifest[fileName] !== serverHash) {
          filesToDownload.push(fileName);
        }
      }

      // Проверяем, какие файлы нужно удалить
      for (const fileName of Object.keys(localManifest)) {
        if (!serverManifest[fileName]) {
          filesToDelete.push(fileName);
        }
      }

      // Скачиваем файлы
      await Promise.all(
        filesToDownload.map(async (fileName) => {
          const fileUrl = `http://192.168.31.96:21010/mods/${fileName}`;
          const filePath = join(dir, fileName);
          const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
          await fs.writeFile(filePath, Buffer.from(response.data));
        })
      );

      // Удаляем лишние файлы
      await Promise.all(
        filesToDelete.map(async (fileName) => {
          const filePath = join(dir, fileName);
          await fs.unlink(filePath);
        })
      );

      return {
        success: true,
        downloaded: filesToDownload,
        deleted: filesToDelete,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to sync files: ${message}` };
    }
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
