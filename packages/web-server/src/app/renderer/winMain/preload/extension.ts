import type { IPCSocket } from '@/preload/ws'
import type { ClientCall, ExposeFunctions } from '.'

// 暴露给后端的方法
export const createExposeExtension = (client: ClientCall) => {
  return {
    async extensionEvent(event, action) {
      return client.extensionEvent(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientExtension = (ipcSocket: IPCSocket) => {
  return {
    async getExtensionErrorMessage() {
      return ipcSocket.remoteQueueExtension.getExtensionErrorMessage()
    },
    async getExtensionList() {
      return ipcSocket.remoteQueueExtension.getExtensionList()
    },
    async getOnlineExtensionList(options) {
      return ipcSocket.remoteQueueExtension.getOnlineExtensionList(options)
    },
    async getOnlineExtensionDetail(id) {
      return ipcSocket.remoteQueueExtension.getOnlineExtensionDetail(id)
    },
    async getOnlineCategories() {
      return ipcSocket.remoteQueueExtension.getOnlineCategories()
    },
    async getOnlineTags() {
      return ipcSocket.remoteQueueExtension.getOnlineTags()
    },
    async resetOnlineData() {
      return ipcSocket.remoteQueueExtension.resetOnlineData()
    },
    async downloadAndParseExtension(url, manifest) {
      return ipcSocket.remoteQueueExtension.downloadAndParseExtension(url, manifest)
    },
    async installExtension(tempExtension) {
      return ipcSocket.remoteQueueExtension.installExtension(tempExtension)
    },
    async updateExtension(tempExtension) {
      return ipcSocket.remoteQueueExtension.updateExtension(tempExtension)
    },
    async startExtension(extension) {
      return ipcSocket.remoteQueueExtension.startExtension(extension)
    },
    async enableExtension(id) {
      return ipcSocket.remoteQueueExtension.enableExtension(id)
    },
    async disableExtension(id) {
      return ipcSocket.remoteQueueExtension.disableExtension(id)
    },
    async restartExtension(id) {
      return ipcSocket.remoteQueueExtension.restartExtension(id)
    },
    async uninstallExtension(id) {
      return ipcSocket.remoteQueueExtension.uninstallExtension(id)
    },
    async restartExtensionHost() {
      return ipcSocket.remoteQueueExtension.restartExtensionHost()
    },
    async getResourceList() {
      return ipcSocket.remoteQueueExtension.getResourceList()
    },
    async getExtensionLastLogs(extId) {
      return ipcSocket.remoteQueueExtension.getExtensionLastLogs(extId)
    },
    async clearExtensionLogs(extId) {
      return ipcSocket.remoteQueueExtension.clearExtensionLogs(extId)
    },
    async getAllExtensionSettings() {
      return ipcSocket.remoteQueueExtension.getAllExtensionSettings()
    },
    async updateExtensionSettings(extId, config) {
      return ipcSocket.remoteQueueExtension.updateExtensionSettings(extId, config)
    },
    async resourceAction<T extends keyof AnyListen.IPCExtension.ResourceAction>(
      action: T,
      params: Parameters<AnyListen.IPCExtension.ResourceAction[T]>[0]
    ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ResourceAction[T]>>> {
      return ipcSocket.remoteExtension.resourceAction(action, params)
    },
    async listProviderAction<T extends keyof AnyListen.IPCExtension.ListProviderAction>(
      action: T,
      params: Parameters<AnyListen.IPCExtension.ListProviderAction[T]>[0]
    ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ListProviderAction[T]>>> {
      return ipcSocket.remoteExtension.listProviderAction(action, params)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
