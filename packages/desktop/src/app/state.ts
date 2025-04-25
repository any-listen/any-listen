import defaultSetting from '@/shared/defaultSetting'

export const appState: {
  envParams: AnyListen.EnvParams
  staticPath: string
  dataPath: string
  appSetting: AnyListen.AppSetting
  isSkipTrayQuit: boolean
  version: AnyListen.CurrentVersionInfo
  shouldUseDarkColors: boolean
  proxy: {
    host: string
    port: string
  }
} = {
  envParams: {
    cmdParams: {},
    workAreaSize: {
      height: 0,
      width: 0,
    },
  },
  proxy: {
    host: '',
    port: '',
  },
  staticPath: '',
  dataPath: '',
  version: {
    version: '',
    commit: '',
    commitDate: 0,
    newVersion: null,
    isUnknown: false,
    isLatest: false,
    reCheck: false,
    status: 'idle',
    ignoreVersion: null,
    progress: null,
  },
  appSetting: defaultSetting,
  isSkipTrayQuit: false,
  shouldUseDarkColors: false,
}
