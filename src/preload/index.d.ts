import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectFolder: () => Promise<string | null>
      downloadManifest: (dir: string) => Promise<{
        success: boolean
        filePath: string
        error: string
      }>
    }
  }
}
