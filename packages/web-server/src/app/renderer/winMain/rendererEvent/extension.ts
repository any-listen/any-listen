import {
  disableExtension,
  downloadAndParseExtension,
  enableExtension,
  getAllExtensionSettings,
  getExtensionErrorMessage,
  getExtensionLastLogs,
  getLocalExtensionList,
  getOnlineExtensionList,
  getResourceList,
  installExtension,
  resourceAction,
  restartExtension,
  restartExtensionHost,
  startExtension,
  uninstallExtension,
  updateExtension,
  updateExtensionSettings,
} from '@/app/modules/extension'
import { broadcast } from '@/modules/ipc/websocket'
import type { ExposeClientFunctions, ExposeServerFunctions } from '.'

// 暴露给前端的方法
export const createExposeExtension = () => {
  return {
    async getExtensionErrorMessage() {
      return getExtensionErrorMessage()
    },
    async getExtensionList() {
      return getLocalExtensionList()
    },
    async getOnlineExtensionList(event, filter) {
      return getOnlineExtensionList(filter)
    },
    async downloadAndParseExtension(event, url, manifest) {
      return downloadAndParseExtension(url, manifest)
    },
    async installExtension(event, tempExtension) {
      return installExtension(tempExtension)
    },
    async updateExtension(event, tempExtension) {
      return updateExtension(tempExtension)
    },
    async startExtension(event, extension) {
      return startExtension(extension)
    },
    async enableExtension(event, id) {
      return enableExtension(id)
    },
    async disableExtension(event, id) {
      return disableExtension(id)
    },
    async restartExtension(event, id) {
      return restartExtension(id)
    },
    async uninstallExtension(event, id) {
      return uninstallExtension(id)
    },
    async restartExtensionHost(event) {
      return restartExtensionHost()
    },
    async getResourceList() {
      return getResourceList()
    },
    async getExtensionLastLogs(event, extId) {
      return getExtensionLastLogs(extId)
    },
    async getAllExtensionSettings() {
      return getAllExtensionSettings()
    },
    async updateExtensionSettings(event, extId, config) {
      return updateExtensionSettings(extId, config)
    },
    async resourceAction(event, action, params) {
      return resourceAction(action, params)
    },
  } satisfies Partial<ExposeClientFunctions>
}

// 暴露给后端的方法
export const createServerExtension = () => {
  const actions = {
    async extensionEvent(event) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remoteQueueExtension.extensionEvent(event)
      })
    },
  } satisfies Partial<ExposeServerFunctions>

  return actions
}
