import { hotKeyConfigUpdatedEvent, hotKeyEnabledEvent } from '@/shared/ipc/hotkey/event'

import * as commit from './commit'

export { getHotKey, getHotkeyStatus, hotkeyConfigAction } from '@/shared/ipc/hotkey'

export const registerRemoteActions = () => {
  const unsub = hotKeyConfigUpdatedEvent.on((config): void => {
    commit.updateConfig(config)
  })

  const unsub2 = hotKeyEnabledEvent.on((enabled): void => {
    commit.updateEnabled(enabled)
  })

  return () => {
    unsub()
    unsub2()
  }
}
