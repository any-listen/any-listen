import defaultSetting from '@/shared/defaultSetting'

export const appState: {
  machineId: string
  envParams: AnyListen.EnvParams
  staticPath: string
  dataPath: string
  cacheDataPath: string
  tempDataPath: string
  appSetting: AnyListen.AppSetting
  isSkipTrayQuit: boolean
  version: AnyListen.CurrentVersionInfo
  shouldUseDarkColors: boolean
  proxy: {
    host: string
    port: string
  }
  'electronParams.ozonePlatform': string
} = {
  machineId: '',
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
  cacheDataPath: '',
  tempDataPath: '',
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
  'electronParams.ozonePlatform': '',
}
