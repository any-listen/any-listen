import { hotKeyEvent, hotKeyState } from '@any-listen/app/modules/hotkey'
import { app } from 'electron'

import { appEvent } from '@/app'

import { getHotKeyConfig, saveHotKeyConfig } from './data'
import { init, unRegisterHotkeyAll } from './globalHotkey'

const initHotKeyState = async () => {
  const config = await getHotKeyConfig()
  hotKeyState.config.local = config.local
  hotKeyState.config.global = config.global
}

export const initHotKey = async () => {
  appEvent.on('inited', () => {
    void initHotKeyState().then(() => {
      init()
    })
  })
  app.on('will-quit', unRegisterHotkeyAll)
}

export const handleHotkeyConfigAction = async (action: AnyListen.HotKey.HotKeyActions) => {
  switch (action.action) {
    case 'config':
      hotKeyState.config[action.data.type].keys = action.data.config
      saveHotKeyConfig(hotKeyState.config)
      hotKeyEvent.config_updated(action.data)
      if (action.data.type === 'global' && hotKeyState.config.global.enable) init()
      break
    case 'enable':
      hotKeyState.config[action.data.type].enable = action.data.enable
      saveHotKeyConfig(hotKeyState.config)
      hotKeyEvent.enable_chenged(action.data)
      if (action.data.type === 'global') action.data.enable ? init() : unRegisterHotkeyAll()
      break
    case 'tempDisable':
      action.data ? unRegisterHotkeyAll() : init()
      break
  }
}

export { hotKeyState, hotKeyEvent }
export { getHotKeyConfig, getHotkeyStatus } from '@any-listen/app/modules/hotkey'
