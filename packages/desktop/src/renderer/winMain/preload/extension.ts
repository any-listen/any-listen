import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'
import type { ExposeFunctions, MainCall } from '.'

// 暴露给后端的方法
export const createExposeExtension = () => {
  return {
    async extensionEvent(event, action) {
      ipcPreloadEvent.extensionEvent(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientExtension = (main: MainCall) => {
  return {
    async getExtensionErrorMessage() {
      return main.getExtensionErrorMessage()
    },
    async getExtensionList() {
      return main.getExtensionList()
    },
    async getOnlineExtensionList(options) {
      return main.getOnlineExtensionList(options)
    },
    async downloadAndParseExtension(url, manifest) {
      return main.downloadAndParseExtension(url, manifest)
    },
    async installExtension(tempExtension) {
      return main.installExtension(tempExtension)
    },
    async updateExtension(tempExtension) {
      return main.updateExtension(tempExtension)
    },
    async startExtension(extension) {
      return main.startExtension(extension)
    },
    async enableExtension(id) {
      return main.enableExtension(id)
    },
    async disableExtension(id) {
      return main.disableExtension(id)
    },
    async restartExtension(id) {
      return main.restartExtension(id)
    },
    async uninstallExtension(id) {
      return main.uninstallExtension(id)
    },
    async restartExtensionHost() {
      return main.restartExtensionHost()
    },
    async getResourceList() {
      return main.getResourceList()
    },
    async getExtensionLastLogs(extId) {
      return main.getExtensionLastLogs(extId)
    },
    async getAllExtensionSettings() {
      return main.getAllExtensionSettings()
    },
    async updateExtensionSettings(extId, config) {
      return main.updateExtensionSettings(extId, config)
    },
    async resourceAction<T extends keyof AnyListen.IPCExtension.ResourceAction>(
      action: T,
      params: Parameters<AnyListen.IPCExtension.ResourceAction[T]>[0]
    ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ResourceAction[T]>>> {
      return main.resourceAction(action, params)
    },
    onExtensionEvent(listener) {
      ipcPreloadEvent.on('extensionEvent', listener)
      return () => {
        ipcPreloadEvent.off('extensionEvent', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
