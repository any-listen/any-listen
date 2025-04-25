export interface State {
  versionInfo: {
    version: string
    commit: string
    commitDate: number
    newVersion: AnyListen.UpdateInfo | null
    isUnknown: boolean
    isLatest: boolean
    reCheck: boolean
    status: AnyListen.UpdateStatus
  }
  ignoreVersion: string | null
  progress: AnyListen.DownloadProgressInfo | null
}

export const versionState: State = {
  versionInfo: {
    version: '0.0.0',
    commit: '',
    commitDate: 0,
    newVersion: null,
    reCheck: false,
    isUnknown: false,
    isLatest: false,
    status: 'idle',
  },
  ignoreVersion: null,
  progress: null,
}
