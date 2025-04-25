import { exposeWorker } from '../utils/worker'
import { registerErrorHandler } from './errorHandler'
import { extensionEvent } from './event'
import {
  disableExtension,
  downloadAndParseExtension,
  enableExtension,
  installExtension,
  loadLocalExtensions,
  restartExtension,
  startExtension,
  startExtensions,
  uninstallExtension,
  updateExtension,
  updateExtensionI18nMessages,
} from './manage'
import { getOnlineExtensionList } from './onlineExtension'
import { buildExtensionSettings, getExtensionLastLogs, updateExtensionSettings, updateResourceListDeounce } from './shared'
import { extensionState } from './state'
import { resourceAction, updateI18nMessage, updateLocale } from './vm'

registerErrorHandler()

const extension = {
  downloadAndParseExtension,
  installExtension,
  loadLocalExtensions,
  startExtension,
  startExtensions,
  enableExtension,
  disableExtension,
  restartExtension,
  uninstallExtension,
  updateExtension,
  setExtensionState(state: {
    clientType: AnyListen.ClientType
    locale: AnyListen.Locale
    'proxy.host': string
    'proxy.port': string
    configFilePath: string
    extensionDir: string
    dataDir: string
    tempDir: string
    preloadScript: string
    onlineExtensionHost: string
  }) {
    extensionState.locale = state.locale
    extensionState.proxy.host = state['proxy.host']
    extensionState.proxy.port = state['proxy.port']
    extensionState.clientType = state.clientType
    extensionState.configFilePath = state.configFilePath
    extensionState.extensionDir = state.extensionDir
    extensionState.dataDir = state.dataDir
    extensionState.tempDir = state.tempDir
    extensionState.preloadScript = state.preloadScript
    extensionState.onlineExtensionHost = state.onlineExtensionHost
  },
  async updateLocale(locale: AnyListen.Locale) {
    extensionState.locale = locale
    extensionState.extensionSettings = null
    await updateExtensionI18nMessages()
    updateI18nMessage()
    updateLocale(locale)
  },
  updateProxy(host: string, port: string) {
    extensionState.proxy.host = host
    extensionState.proxy.port = port
  },
  updateOnlineExtensionListHost(host: string) {
    extensionState.onlineExtensionHost = host
  },
  async getOnlineExtensionList(filter: AnyListen.IPCExtension.OnlineListFilterOptions) {
    return getOnlineExtensionList(filter)
  },
  getLocalExtensionList() {
    return extensionState.extensions
  },
  musicListAction(action: AnyListen.IPCList.ActionList) {
    extensionEvent.musicListAction(action)
  },
  playerEvent(event: AnyListen.IPCPlayer.PlayerEvent) {
    extensionEvent.playerEvent(event)
  },
  playListAction(action: AnyListen.IPCPlayer.PlayListAction) {
    extensionEvent.playListAction(action)
  },
  playHistoryListAction(action: AnyListen.IPCPlayer.PlayHistoryListAction) {
    extensionEvent.playHistoryListAction(action)
  },
  getResourceList() {
    return extensionState.resourceList
  },
  async getExtensionLastLogs(extId?: string) {
    return getExtensionLastLogs(extId)
  },
  async getAllExtensionSettings() {
    return buildExtensionSettings()
  },
  async updateExtensionSettings(extId: string, config: Record<string, unknown>) {
    await updateExtensionSettings(extId, config)
  },
  // async resourceAction(extId: string, config: Record<string, unknown>) {
  //   await updateExtensionSettings(extId, config)
  // },
  async resourceAction<T extends keyof AnyListen.IPCExtension.ResourceAction>(
    action: T,
    params: Parameters<AnyListen.IPCExtension.ResourceAction[T]>[0]
  ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ResourceAction[T]>>> {
    return resourceAction(action, params)
  },
  // clientConnected(id: string) {
  //   extensionEvent.clientConnected(id)
  // },
  // clientDisconnected(id: string) {
  //   extensionEvent.clientDisconnected(id)
  // },
} as const

void exposeWorker<
  AnyListen.IPCExtension.MainIPCActions & {
    inited: () => void
  }
>(extension).then(({ remote }) => {
  extensionState.remoteFuncs = remote
  // console.log('object', remote.ini())
  remote.inited()
  extensionEvent.on('extensionEvent', (action: AnyListen.IPCExtension.EventExtension) => {
    void remote.onExtensionEvent(action)
  })
  extensionEvent.on('loaded', () => {
    updateResourceListDeounce()
  })
  extensionEvent.on('stoped', () => {
    updateResourceListDeounce()
  })
})

console.log('extension host running')
export type workerExtensionSeriveTypes = typeof extension
