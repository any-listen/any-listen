import { app } from 'electron'
import { init, registerHotkey, unRegisterHotkey, unRegisterHotkeyAll } from './globalHotkey'

import { getHotKeyConfig, saveHotKeyConfig } from './data'
import { hotKeyEvent, hotKeyState } from '@any-listen/app/modules/hotkey'
import type { HOTKEY_Type } from '@any-listen/common/hotKey'

const initHotKeyState = async () => {
  const config = await getHotKeyConfig()
  hotKeyState.config.local = config.local
  hotKeyState.config.global = config.global
}

export const initHotKey = async () => {
  await initHotKeyState()
  app.on('ready', () => {
    init()
  })
  app.on('will-quit', unRegisterHotkeyAll)
}

export const handleHotkeyConfigAction = async (action: AnyListen.HotKey.HotKeyActions<HOTKEY_Type>): Promise<boolean> => {
  switch (action.action) {
    case 'config':
      saveHotKeyConfig(action.data)
      hotKeyState.config = action.data
      hotKeyEvent.hot_key_config_update(action.data)
      return true
    case 'enable':
      hotKeyState.tempDisable = false
      action.data ? init() : unRegisterHotkeyAll()
      return true
    case 'tempDisable':
      if (hotKeyState.tempDisable != action.data) {
        hotKeyState.tempDisable = action.data
        action.data ? unRegisterHotkeyAll() : init()
      }
      return true
    case 'register':
      return registerHotkey(action.data)
    case 'unregister':
      unRegisterHotkey(action.data)
      return true
    // default:
    //   console.warn('unknown action:', action)
    //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
    //   let unknownAction: never = action
    //   return false
  }
}

export { hotKeyState, hotKeyEvent }
export { getHotKeyConfig, getHotkeyStatus } from '@any-listen/app/modules/hotkey'
