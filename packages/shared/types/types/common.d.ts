import type { Locale as _Locale } from '@any-listen/i18n'

declare global {
  namespace AnyListen {
    type BuildTarget = 'desktop' | 'web'

    type ClientType = 'desktop' | 'web' | 'mobile'

    type Locale = _Locale

    interface IPCActionBase<A> {
      action: A
    }
    interface IPCActionData<A, D> extends IPCActionBase<A> {
      data: D
    }
    type IPCAction<A, D = undefined> = D extends undefined ? IPCActionBase<A> : IPCActionData<A, D>

    type IPCActionFuncNoParams<A, Res = undefined> = Res extends undefined
      ? (action: IPCActionBase<A>) => Promise<void>
      : (action: IPCActionBase<A>) => Promise<Res>
    type IPCActionFunc<A, D, Res = undefined> = Res extends undefined
      ? (action: IPCActionData<A, D>) => Promise<void>
      : (action: IPCActionData<A, D>) => Promise<Res>

    type IPCRestAction<A, D extends unknown[]> = IPCActionData<A, D>

    interface FileFilter {
      // Docs: https://electronjs.org/docs/api/structures/file-filter
      extensions: string[]
      name: string
    }
    interface OpenDialogOptions {
      title: string
      defaultPath?: string
      buttonLabel?: string
      filters?: FileFilter[]
      /** Contains which features the dialog should use. The following values are supported: */
      properties?: Array<
        | 'openFile'
        | 'openDirectory'
        | 'multiSelections'
        | 'showHiddenFiles'
        | 'createDirectory'
        | 'promptToCreate'
        | 'noResolveAliases'
        | 'treatPackageAsDirectory'
        | 'dontAddToRecent'
      >
    }
    interface OpenDialogResult {
      canceled: boolean
      filePaths: string[]
    }
    interface SaveDialogOptions {
      title: string
      defaultPath?: string
      buttonLabel?: string
      filters?: FileFilter[]
      properties?: Array<
        'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'
      >
    }
    interface SaveDialogResult {
      canceled: boolean
      filePath: string
    }

    interface LoginDevice {
      clientId: string
      timestamp: number
      lastActive: number
      userAgent: string
      ip: string
    }

    interface CurrentVersionInfo {
      version: string
      commit: string
      commitDate: number
      newVersion: UpdateInfo | null
      isUnknown: boolean
      isLatest: boolean
      reCheck: boolean
      status: UpdateStatus
      ignoreVersion: string | null
      progress: DownloadProgressInfo | null
    }
    type UpdateStatus = 'downloaded' | 'downloading' | 'error' | 'checking' | 'idle'
    interface DownloadProgressInfo {
      total: number
      delta: number
      transferred: number
      percent: number
      bytesPerSecond: number
    }
    interface VersionInfo {
      version: string
      desc: string
      time: string
    }
    interface UpdateInfo extends VersionInfo {
      history: VersionInfo[]
      beta?: VersionInfo[]
      // isForce: boolean
      // url: string
    }
    interface LastStartInfo {
      time: number
      version: string
    }

    interface LogInfo {
      type: 'debug' | 'info' | 'warn' | 'error'
      id: string
      timestamp: number
      name: string
      message: string
    }

    interface Logger {
      debug: (message: unknown, ...args: unknown[]) => void
      info: (message: unknown, ...args: unknown[]) => void
      warn: (message: unknown, ...args: unknown[]) => void
      error: (message: unknown, ...args: unknown[]) => void
    }
  }
}
