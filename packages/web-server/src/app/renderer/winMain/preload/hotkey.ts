import type { IPCSocket } from '@/preload/ws'

import type { ClientCall, ExposeFunctions } from '.'

// 暴露给后端的方法
export const createExposeHotkey = (client: ClientCall) => {
  return {
    async hotKeyDown(event, info) {
      return client.hotKeyDown(info)
    },
    async hotKeyConfigUpdated(event, config) {
      return client.hotKeyConfigUpdated(config)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientHotkey = (ipcSocket: IPCSocket) => {
  return {
    async getHotKey() {
      return ipcSocket.remote.getHotKey()
    },
    async getHotkeyStatus() {
      return new Map()
    },
    async hotkeyConfigAction(action) {
      return ipcSocket.remote.hotkeyConfigAction(action)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
