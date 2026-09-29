import { hotKeyState, hotKeyEvent } from '@any-listen/app/modules/hotkey'

import { getHotKeyConfig, saveHotKeyConfig } from './data'

const initHotKeyState = async () => {
  const config = await getHotKeyConfig()
  hotKeyState.config.local = config.local
  hotKeyState.config.global = config.global
}

export const initHotKey = async () => {
  await initHotKeyState()
}

export const handleHotkeyConfigAction = async (action: AnyListen.HotKey.HotKeyActions) => {
  switch (action.action) {
    case 'config':
      hotKeyState.config[action.data.type].keys = action.data.config
      saveHotKeyConfig(hotKeyState.config)
      hotKeyEvent.config_updated(action.data)
      break
    case 'enable':
      hotKeyState.config[action.data.type].enable = action.data.enable
      saveHotKeyConfig(hotKeyState.config)
      hotKeyEvent.enable_chenged(action.data)
      break
    default:
      break
  }
}

export { hotKeyState, hotKeyEvent }
export { getHotKeyConfig, getHotkeyStatus } from '@any-listen/app/modules/hotkey'
