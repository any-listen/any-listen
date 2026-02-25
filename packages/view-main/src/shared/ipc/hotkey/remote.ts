import type { HOTKEY_Type } from '@any-listen/common/hotKey'

import { hotKeyConfigUpdatedEvent, hotKeyDownEvent } from './event'

export default {
  async hotKeyDown(config) {
    hotKeyDownEvent.emit(config)
  },
  async hotKeyConfigUpdated(config) {
    hotKeyConfigUpdatedEvent.emit(config as AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
