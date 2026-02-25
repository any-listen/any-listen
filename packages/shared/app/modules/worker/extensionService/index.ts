import { setGHMirrorHosts } from '@any-listen/nodejs/mirrorReuqest'
import { setProxyByHost } from '@any-listen/nodejs/request'

import { exposeWorker } from '../utils/worker'
import { registerErrorHandler } from './errorHandler'
import { extensionEvent } from './event'
import { initI18n } from './i18n'
import { internalExtensionContextState } from './internalExtension/state'
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
import {
  getOnlineCategories,
  getOnlineExtensionDetail,
  getOnlineExtensionList,
  getOnlineTags,
  initOnlineList,
  resetOnlineData,
} from './onlineExtension'
import { resetI18n } from './onlineExtension/i18n'
import {
  buildExtensionSettings,
  clearExtensionLogs,
  getExtensionLastLogs,
  updateExtensionSettings,
  updateResourceListThrottle,
} from './shared'
import { extensionState } from './state'
import { listProviderAction, resourceAction, updateI18nMessage, updateLocale } from './vm'

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
    gHMirrorHosts: string
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

    setProxyByHost(state['proxy.host'], state['proxy.port'])
    setGHMirrorHosts(state.gHMirrorHosts)
    initI18n()
  },
  async updateLocale(locale: AnyListen.Locale) {
    extensionState.locale = locale
    extensionState.extensionSettings = null
    await updateExtensionI18nMessages()
    updateI18nMessage()
    updateLocale(locale)
    resetI18n()
    extensionEvent.localeChanged(locale)
  },
  updateProxy(host: string, port: string) {
    extensionState.proxy.host = host
    extensionState.proxy.port = port
    setProxyByHost(host, port)
  },
  updateOnlineExtensionListHost(host: string) {
    extensionState.onlineExtensionHost = host
  },
  updateGHMirrorHosts(host: string) {
    setGHMirrorHosts(host)
  },
  async getOnlineExtensionList(filter: AnyListen.IPCExtension.OnlineListFilterOptions) {
    return getOnlineExtensionList(filter)
  },
  async getOnlineCategories() {
    return getOnlineCategories()
  },
  async getOnlineTags() {
    return getOnlineTags()
  },
  async getOnlineExtensionDetail(id: string) {
    return getOnlineExtensionDetail(id)
  },
  async resetOnlineData() {
    resetOnlineData()
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
  async clearExtensionLogs(extId?: string) {
    await clearExtensionLogs(extId)
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
    const context = internalExtensionContextState.contexts.get(params.extensionId)
    if (context) return context.context.resourceAction!(action, params)
    return resourceAction(action, params)
  },
  async listProviderAction<T extends keyof AnyListen.IPCExtension.ListProviderAction>(
    action: T,
    params: Parameters<AnyListen.IPCExtension.ListProviderAction[T]>[0]
  ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ListProviderAction[T]>>> {
    const context = internalExtensionContextState.contexts.get(params.extensionId)
    if (context) return context.context.listProviderAction!(action, params)
    return listProviderAction(action, params)
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
  extensionEvent.on('extensionEvent', (action: AnyListen.IPCExtension.EventExtension) => {
    void remote.onExtensionEvent(action)
  })
  extensionEvent.on('loaded', () => {
    updateResourceListThrottle()
  })
  extensionEvent.on('stopped', () => {
    updateResourceListThrottle()
  })
  extensionEvent.on('listAdd', () => {
    extensionState.extensionSettings = null
  })
  extensionEvent.on('listRemove', () => {
    extensionState.extensionSettings = null
  })
  extensionEvent.on('listSet', () => {
    extensionState.extensionSettings = null
  })
  extensionEvent.on('listUpdate', () => {
    extensionState.extensionSettings = null
  })

  remote.inited()
  void initOnlineList()
})

console.log('extension host running')
export type workerExtensionSeriveTypes = typeof extension
