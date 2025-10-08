import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import fs from 'fs/promises';
import crypto from 'crypto';
import axios from 'axios';
import icon from '../../resources/icon.png?asset';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function loadConfig() {
  if (is.dev) return { SERVER_URL: 'http://192.168.31.96:21010' };
  try {
    // Путь к config.json относительно portable-исполняемого файла
    const configPath = join(app.getPath('exe'), '../config.json');
    const configData = await readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Failed to load config:', error);
    return { SERVER_URL: '' }; // Резервное значение
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 320,
    height: 460,
    show: false,
    resizable: false,
    darkTheme: true,
    title: 'Updater',
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

async function compareLocalFilesWithManifest(
  dir,
  serverManifest
): Promise<{ success: boolean; filesToDownload: string[]; filesToDelete: string[] } | { error: string }> {
  try {
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

    for (const [fileName, serverHash] of Object.entries(serverManifest)) {
      if (!localManifest[fileName] || localManifest[fileName] !== serverHash) {
        filesToDownload.push(fileName);
      }
    }

    for (const fileName of Object.keys(localManifest)) {
      if (!serverManifest[fileName]) {
        filesToDelete.push(fileName);
      }
    }

    console.log(`ToDownload: ${filesToDownload.length} | ToDelete: ${filesToDelete.length}`);

    return { success: true, filesToDownload, filesToDelete };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to compare files: ${message}` };
  }
}

app.whenReady().then(async () => {
  const config = await loadConfig();
  const SERVER_URL = config.SERVER_URL;

  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle('select-folder', async () => {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return filePaths.length ? filePaths[0] : null;
  });

  ipcMain.handle('check-server-availability', async () => {
    if (!SERVER_URL) return { error: 'Server URL not defined' };
    try {
      const response = await axios.get(SERVER_URL, { timeout: 5000 });
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

  ipcMain.handle('compare-files', async (_event, dir) => {
    if (!dir) return { error: 'No directory selected' };
    if (!SERVER_URL) return { error: 'Server URL not defined' };
    try {
      const response = await axios.get(`${SERVER_URL}/manifest.json`);
      const serverManifest = response.data;

      const compareResult = await compareLocalFilesWithManifest(dir, serverManifest);

      if ('error' in compareResult) {
        return { error: compareResult.error };
      }

      const { filesToDownload, filesToDelete } = compareResult;

      return {
        success: true,
        toDownload: filesToDownload,
        toDelete: filesToDelete,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to sync files: ${message}` };
    }
  });

  ipcMain.handle('sync-files', async (_event, dir) => {
    if (!dir) return { error: 'No directory selected' };
    if (!SERVER_URL) return { error: 'Server URL not defined' };
    try {
      // Получаем манифест с сервера
      const response = await axios.get(`${SERVER_URL}/manifest.json`);
      const serverManifest = response.data;

      const compareResult = await compareLocalFilesWithManifest(dir, serverManifest);

      if ('error' in compareResult) {
        return { error: compareResult.error };
      }

      const { filesToDownload, filesToDelete } = compareResult;

      console.log('ToDownload: ', filesToDownload.length);
      console.log('ToDelete: ', filesToDelete.length);

      // Скачиваем файлы
      await Promise.all(
        filesToDownload.map(async (fileName) => {
          const fileUrl = `${SERVER_URL}/mods/${fileName}`;
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
