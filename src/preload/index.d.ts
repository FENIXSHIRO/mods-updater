import { ElectronAPI } from '@electron-toolkit/preload';
import type { Config } from '../types/Config';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getConfig: () => Promise<Config>;
      selectGameDir: () => Promise<string | null>;
      checkServerAvailability: () => Promise<{ success: boolean; address: string; error?: string }>;
      compareFiles: (dir: string) => Promise<
        | {
            success: boolean;
            toDownload: string[];
            toDelete: string[];
          }
        | { error?: string }
      >;
      downloadManifest: (dir: string) => Promise<
        | {
            success: boolean;
            filePath: string;
          }
        | { error: string }
      >;
      syncFiles: (dir: string) => Promise<
        | {
            success: boolean;
            downloaded: string[];
            deleted: string[];
          }
        | { error?: string }
      >;
    };
  }
}
