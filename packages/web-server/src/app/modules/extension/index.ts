import { extensionEvent, extensionState, initExtensionModule } from '@any-listen/app/modules/extension'
import { musicListEvent } from '@any-listen/app/modules/musicList'
import { workers } from '@any-listen/app/modules/worker'
import { DEFAULT_LANG, EXTENSION, STORE_NAMES } from '@any-listen/common/constants'
import { checkAndCreateDir, joinPath, readFile } from '@any-listen/nodejs'

import { appEvent, appState } from '@/app/app'
import { playerEvent } from '@/app/modules/player'
import { startExtensionServiceWorker } from '@/app/worker'
import { extensionLog } from '@/shared/log4js'

const handleExtensionLog = (info: AnyListen.LogInfo) => {
  switch (info.type) {
    case 'info':
      extensionLog.info(`[${info.id}] ${info.message}`)
      break
    case 'warn':
      extensionLog.warn(`[${info.id}] ${info.message}`)
      break
    case 'error':
      extensionLog.error(`[${info.id}] ${info.message}`)
      break
    case 'debug':
      extensionLog.debug(`[${info.id}] ${info.message}`)
      break
  }
}

const setupExtension = async () => {
  await workers.extensionService.setExtensionState({
    locale: appState.appSetting['common.langId'] ?? DEFAULT_LANG,
    'proxy.host': appState.proxy.host,
    'proxy.port': appState.proxy.port,
    clientType: 'web',
    configFilePath: joinPath(extensionState.extensionDir, EXTENSION.configFileName),
    extensionDir: joinPath(extensionState.extensionDir, EXTENSION.extDirName),
    tempDir: joinPath(extensionState.extensionDir, EXTENSION.tempDirName),
    dataDir: joinPath(extensionState.extensionDir, EXTENSION.dataDirName),
    preloadScript: (await readFile(joinPath(__dirname, 'extension-preload.js'))).toString(),
    onlineExtensionHost: appState.appSetting['extension.onlineExtensionHost'],
    gHMirrorHosts: global.anylisten.config['extension.ghMirrorHosts'].join('\n'),
  })
  await initExtensionModule()
  await workers.extensionService.loadLocalExtensions()
  await workers.extensionService.startExtensions()
  extensionEvent.setup(workers.extensionService)
}
export const initExtension = async () => {
  extensionState.extensionDir = joinPath(appState.dataPath, STORE_NAMES.EXTENSION)
  await checkAndCreateDir(extensionState.extensionDir)
  await setupExtension()

  extensionEvent.on('extensionEvent', (event) => {
    switch (event.action) {
      case 'logOutput':
        handleExtensionLog(event.data)
        break

      default:
        break
    }
  })
  appEvent.on('updated_config', (keys, setting) => {
    if (keys.includes('extension.onlineExtensionHost')) {
      try {
        void workers.extensionService.updateOnlineExtensionListHost(setting['extension.onlineExtensionHost']!)
      } catch {}
    }
    // if (keys.includes('extension.ghMirrorHosts')) {
    //   try {
    //     void workers.extensionService.updateGHMirrorHosts(setting['extension.ghMirrorHosts']!)
    //   } catch {}
    // }
  })
  appEvent.on('locale_change', (locale) => {
    try {
      void workers.extensionService.updateLocale(locale)
    } catch {}
  })
  appEvent.on('proxy_changed', (host, port) => {
    try {
      void workers.extensionService.updateProxy(host, port)
    } catch {}
  })
  // appEvent.on('clientConnected', (socket) => {
  //   try {
  //     void workers.extensionService.clientConnected(socket.keyInfo.clientId)
  //     socket.onClose(() => {
  //       try {
  //         void workers.extensionService.clientDisconnected(socket.keyInfo.clientId)
  //       } catch {}
  //     })
  //   } catch {}
  // })
  playerEvent.on('playerEvent', (event) => {
    try {
      void workers.extensionService.playerEvent(event)
    } catch {}
  })
  playerEvent.on('playListAction', async (action) => {
    try {
      void workers.extensionService.playListAction(action)
    } catch {}
  })
  playerEvent.on('playHistoryListAction', async (action) => {
    try {
      void workers.extensionService.playHistoryListAction(action)
    } catch {}
  })
  musicListEvent.on('listAction', async (action) => {
    try {
      void workers.extensionService.musicListAction(action)
    } catch {}
  })
}

// TODO: create extension icon public path
export const loadLocalExtensions = async () => {
  return workers.extensionService.loadLocalExtensions()
}

export const startExtensions = async () => {
  return workers.extensionService.startExtensions()
}

export const downloadAndParseExtension = async (url: string, manifest?: AnyListen.Extension.Manifest) => {
  return workers.extensionService.downloadAndParseExtension(url, manifest)
}

export const installExtension = async (tempExtension: AnyListen.Extension.Extension) => {
  return workers.extensionService.installExtension(tempExtension)
}

export const updateExtension = async (extension: AnyListen.Extension.Extension) => {
  return workers.extensionService.updateExtension(extension)
}

export const startExtension = async (id: string) => {
  return workers.extensionService.startExtension(id)
}

export const enableExtension = async (id: string) => {
  return workers.extensionService.enableExtension(id)
}

export const disableExtension = async (id: string) => {
  return workers.extensionService.disableExtension(id)
}

export const restartExtension = async (id: string) => {
  return workers.extensionService.restartExtension(id)
}

export const uninstallExtension = async (id: string) => {
  return workers.extensionService.uninstallExtension(id)
}

export const getOnlineExtensionList = async (filter: AnyListen.IPCExtension.OnlineListFilterOptions) => {
  return workers.extensionService.getOnlineExtensionList(filter)
}
export const getOnlineExtensionDetail = async (id: string) => {
  return workers.extensionService.getOnlineExtensionDetail(id)
}
export const getOnlineCategories = async () => {
  return workers.extensionService.getOnlineCategories()
}
export const getOnlineTags = async () => {
  return workers.extensionService.getOnlineTags()
}
export const resetOnlineData = async () => {
  return workers.extensionService.resetOnlineData()
}

export const getLocalExtensionList = async () => {
  return workers.extensionService.getLocalExtensionList()
}

export const restartExtensionHost = async () => {
  await startExtensionServiceWorker()
  await setupExtension()
}

export const getExtensionErrorMessage = async () => {
  return extensionState.crashMessage
}

export const getResourceList = async () => {
  return workers.extensionService.getResourceList()
}

export const getExtensionLastLogs = async (id?: string) => {
  return workers.extensionService.getExtensionLastLogs(id)
}

export const clearExtensionLogs = async (id?: string) => {
  return workers.extensionService.clearExtensionLogs(id)
}

export const getAllExtensionSettings = async () => {
  return workers.extensionService.getAllExtensionSettings()
}

export const updateExtensionSettings = async (extId: string, config: Record<string, unknown>) => {
  return workers.extensionService.updateExtensionSettings(extId, config)
}

type RA = AnyListen.IPCExtension.ResourceAction
export const resourceAction = async <T extends keyof RA>(
  action: T,
  params: Parameters<RA[T]>[0]
): Promise<Awaited<ReturnType<RA[T]>>> => {
  return workers.extensionService.resourceAction(action, params)
}

type LPA = AnyListen.IPCExtension.ListProviderAction
export const listProviderAction = async <T extends keyof LPA>(
  action: T,
  params: Parameters<LPA[T]>[0]
): Promise<Awaited<ReturnType<LPA[T]>>> => {
  return workers.extensionService.listProviderAction(action, params)
}

export { extensionEvent, extensionState }
