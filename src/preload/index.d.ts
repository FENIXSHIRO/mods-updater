import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      selectFolder: () => Promise<string | null>;
      checkServerAvailability: () => Promise<{ success: boolean; error?: string }>;
      downloadManifest: (dir: string) => Promise<{
        success: boolean;
        filePath: string;
        error: string;
      }>;
      syncFiles: (dir: string) => Promise<{
        success: boolean;
        downloaded: string[];
        deleted: string[];
        error?: string;
      }>;
    };
  }
}
