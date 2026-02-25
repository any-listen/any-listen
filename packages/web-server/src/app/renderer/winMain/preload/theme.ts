import type { IPCSocket } from '@/preload/ws'

import type { ClientCall, ExposeFunctions } from '.'

// 暴露给后端的方法
export const createExposeTheme = (client: ClientCall) => {
  return {
    async themeChanged(socket, setting) {
      return client.themeChanged(setting)
    },
    async themeListChanged(socket, list) {
      return client.themeListChanged(list)
    },
  } as const satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientTheme = (ipcSocket: IPCSocket) => {
  return {
    async getThemeSetting() {
      return ipcSocket.remoteQueueTheme.getThemeSetting()
    },
    async getThemeList() {
      return ipcSocket.remoteQueueTheme.getThemeList()
    },
    async saveTheme(theme) {
      return ipcSocket.remoteQueueTheme.saveTheme(theme)
    },
    async removeTheme(id) {
      return ipcSocket.remoteQueueTheme.removeTheme(id)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
