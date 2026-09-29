import { hotKeyConfigUpdatedEvent, hotKeyEnabledEvent } from './event'

export default {
  async hotKeyConfigUpdated(config) {
    hotKeyConfigUpdatedEvent.emit(config)
  },
  async hotKeyEnabled(config) {
    hotKeyEnabledEvent.emit(config)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
