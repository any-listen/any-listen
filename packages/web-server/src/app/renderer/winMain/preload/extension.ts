import type { IPCSocket } from '@/preload/ws'
import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'
import type { ExposeFunctions } from '.'

// 暴露给后端的方法
export const createExposeExtension = () => {
  return {
    async extensionEvent(event, action) {
      ipcPreloadEvent.extensionEvent(action)
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
    onExtensionEvent(listener) {
      ipcPreloadEvent.on('extensionEvent', listener)
      return () => {
        ipcPreloadEvent.off('extensionEvent', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
