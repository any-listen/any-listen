import { getHotKeyConfig, handleHotkeyConfigAction } from '@/app/modules/hotKey'
import { broadcast } from '@/modules/ipc/websocket'

import type { ExposeServerFunctions, ExposeClientFunctions } from '.'

// 暴露给前端的方法
export const createExposeHotkey = () => {
  return {
    async getHotKey(event) {
      return getHotKeyConfig()
    },
    async hotkeyConfigAction(event, action) {
      return handleHotkeyConfigAction(action)
    },
  } satisfies Partial<ExposeClientFunctions>
}

// 暴露给前端的方法
export const createServerHotkey = () => {
  return {
    async hotKeyConfigUpdated(config) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.hotKeyConfigUpdated(config)
      })
    },
    async hotKeyEnabled(config) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.hotKeyEnabled(config)
      })
    },
  } satisfies Partial<ExposeServerFunctions>
}
