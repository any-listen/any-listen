import { appEvent, appState } from '@/app/app'
import { startExtensionServiceWorker } from '@/app/worker'
import { extensionEvent, extensionState } from '@any-listen/app/modules/extension'
import { workers } from '@any-listen/app/modules/worker'
import { EXTENSION, STORE_NAMES } from '@any-listen/common/constants'
import { checkAndCreateDir, joinPath, readFile } from '@any-listen/nodejs'
import { playerEvent } from '@/app/modules/player'
import { musicListEvent } from '@any-listen/app/modules/musicList'
import { extensionLog } from '@/shared/log4js'

const handleExtensionLog = (info: AnyListen.ExtensionVM.LogInfo) => {
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
    locale: appState.appSetting['common.langId'] ?? 'en-us',
    'proxy.host': appState.proxy.host,
    'proxy.port': appState.proxy.port,
    clientType: 'web',
    configFilePath: joinPath(extensionState.extensionDir, EXTENSION.configFileName),
    extensionDir: joinPath(extensionState.extensionDir, EXTENSION.extDirName),
    tempDir: joinPath(extensionState.extensionDir, EXTENSION.tempDirName),
    dataDir: joinPath(extensionState.extensionDir, EXTENSION.dataDirName),
    preloadScript: (await readFile(joinPath(__dirname, 'extension-preload.js'))).toString(),
    onlineExtensionHost: appState.appSetting['extension.onlineExtensionHost'],
  })
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
    if (keys.includes('common.langId')) {
      try {
        void workers.extensionService.updateLocale(setting['common.langId'] ?? 'zh-cn')
      } catch {}
    }
    if (keys.includes('extension.onlineExtensionHost')) {
      try {
        void workers.extensionService.updateOnlineExtensionListHost(setting['extension.onlineExtensionHost']!)
      } catch {}
    }
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

export const getAllExtensionSettings = async () => {
  return workers.extensionService.getAllExtensionSettings()
}

export const updateExtensionSettings = async (extId: string, config: Record<string, unknown>) => {
  return workers.extensionService.updateExtensionSettings(extId, config)
}

export const resourceAction: AnyListen.IPCExtension.ResourceAction = async (action) => {
  return workers.extensionService.resourceAction(
    // @ts-expect-error
    action
  )
}

export { extensionEvent, extensionState }
