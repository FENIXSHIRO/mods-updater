import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { readFile, writeFile, unlink, readdir } from 'fs/promises';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import crypto from 'crypto';
import axios from 'axios';
import icon from '../../resources/icon.png?asset';
import devConfig from '../../config.json';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function loadConfig() {
  if (is.dev) return devConfig;
  try {
    const configPath = join(app.getPath('exe'), '../config.json');
    const configData = await readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Failed to load config:', error);
    return {};
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function saveConfig(config) {
  try {
    if (is.dev) {
      Object.assign(devConfig, config); // Обновляем devConfig в памяти
    } else {
      const configPath = join(app.getPath('exe'), '../config.json');
      await writeFile(configPath, JSON.stringify(config, null, 2));
    }
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

async function compareLocalFilesWithManifest(
  dir,
  serverManifest
): Promise<{ success: boolean; filesToDownload: string[]; filesToDelete: string[] } | { error: string }> {
  try {
    const localFiles = await readdir(dir, { withFileTypes: true });
    const localManifest = {};

    await Promise.all(
      localFiles
        .filter((dirent) => dirent.isFile())
        .map(async (dirent) => {
          const filePath = join(dir, dirent.name);
          const data = await readFile(filePath);
          localManifest[dirent.name] = crypto.createHash('sha256').update(data).digest('hex');
        })
    );

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

app.whenReady().then(async () => {
  const config = await loadConfig();
  const SERVER_URL = config.SERVER_URL;

  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle('select-folder', async () => {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (filePaths.length) {
      const selectedPath = filePaths[0];
      config.GAME_DIR = selectedPath;
      await saveConfig(config);
      return selectedPath;
    }
    return null;
  });

  ipcMain.handle('get-game-dir', async () => {
    console.log(config);
    return config.GAME_DIR || null;
  });

  ipcMain.handle('check-server-availability', async () => {
    if (!SERVER_URL) return { error: 'Server URL not defined' };
    try {
      const response = await axios.get(SERVER_URL, { timeout: 5000 });
      if (response.status === 200) {
        return { success: true, address: SERVER_URL };
      }
      return { success: false, address: SERVER_URL };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, address: SERVER_URL, error: `Server unavailable: ${message}` };
    }
  });

  ipcMain.handle('download-manifest', async (_event, dir) => {
    if (!dir) return { error: 'No directory selected' };

    try {
      const files = await readdir(dir, { withFileTypes: true });
      const manifest = {};

      await Promise.all(
        files
          .filter((dirent) => dirent.isFile())
          .map(async (dirent) => {
            const filePath = `${dir}/${dirent.name}`;
            const data = await readFile(filePath);
            manifest[dirent.name] = crypto.createHash('sha256').update(data).digest('hex');
          })
      );

      const { filePath } = await dialog.showSaveDialog({
        defaultPath: 'manifest.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (filePath) {
        await writeFile(filePath, JSON.stringify(manifest, null, 2));
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
      const response = await axios.get(`${SERVER_URL}/manifest.json`);
      const serverManifest = response.data;

      const compareResult = await compareLocalFilesWithManifest(dir, serverManifest);

      if ('error' in compareResult) {
        return { error: compareResult.error };
      }

      const { filesToDownload, filesToDelete } = compareResult;

      console.log('ToDownload: ', filesToDownload.length);
      console.log('ToDelete: ', filesToDelete.length);

      await Promise.all(
        filesToDownload.map(async (fileName) => {
          const fileUrl = `${SERVER_URL}/mods/${fileName}`;
          const filePath = join(dir, fileName);
          const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
          await writeFile(filePath, Buffer.from(response.data));
        })
      );

      await Promise.all(
        filesToDelete.map(async (fileName) => {
          const filePath = join(dir, fileName);
          await unlink(filePath);
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
