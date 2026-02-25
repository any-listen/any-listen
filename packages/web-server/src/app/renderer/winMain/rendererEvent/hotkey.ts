/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { HOTKEY_Type } from '@any-listen/common/hotKey'

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
      return handleHotkeyConfigAction(action as AnyListen.HotKey.HotKeyActions<HOTKEY_Type>)
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
  } satisfies Partial<ExposeServerFunctions>
}
