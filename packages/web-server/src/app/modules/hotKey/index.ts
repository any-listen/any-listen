import { hotKeyState, hotKeyEvent } from '@any-listen/app/modules/hotkey'
import type { HOTKEY_Type } from '@any-listen/common/hotKey'

import { getHotKeyConfig, saveHotKeyConfig } from './data'

const initHotKeyState = async () => {
  const config = await getHotKeyConfig()
  hotKeyState.config.local = config.local
  hotKeyState.config.global = config.global
}

export const initHotKey = async () => {
  await initHotKeyState()
}

export const handleHotkeyConfigAction = async (action: AnyListen.HotKey.HotKeyActions<HOTKEY_Type>): Promise<boolean> => {
  switch (action.action) {
    case 'config':
      // global.anylisten.event_app.saveConfig(data, source)
      saveHotKeyConfig(action.data)
      hotKeyState.config = action.data
      hotKeyEvent.hot_key_config_update(action.data)
      return true
    case 'enable':
      hotKeyState.tempDisable = false
      return true
    case 'tempDisable':
      hotKeyState.tempDisable = action.data
      return true
    case 'register':
    case 'unregister':
      return true
    default:
      console.warn('unknown action:', action)
      // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      let unknownAction: never = action
      return false
  }
}

export { hotKeyState, hotKeyEvent }
export { getHotKeyConfig, getHotkeyStatus } from '@any-listen/app/modules/hotkey'
