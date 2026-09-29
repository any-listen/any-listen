import { hotKeyEvent, hotKeyState } from '@any-listen/app/modules/hotkey'
import { globalShortcut } from 'electron'

import { log } from '@/shared/log'

const handleKeyDown = (key: string) => {
  hotKeyEvent.hot_key_down(key)
}

const transformedKeyRxp = /(^|\+)[a-z]/g

const transformedKey = (key: string): string => {
  if (key.includes('arrow')) key = key.replace(/arrow/g, '')
  return key.replace('mod', 'CommandOrControl').replace(transformedKeyRxp, (l) => l.toUpperCase())
}

const registerHotkey = (key: string): boolean => {
  let targetKeyStatus = hotKeyState.state.get(key)
  if (targetKeyStatus) return true
  const transKey = transformedKey(key)
  // console.log('Register key:', transKey)
  const isRegistered = globalShortcut.isRegistered(transKey)
  const status = isRegistered
    ? false
    : globalShortcut.register(transKey, () => {
        handleKeyDown(key)
      })
  hotKeyState.state.set(key, status)
  return status
}

// const unRegisterHotkey = (key: string) => {
//   let transKey = transformedKey(key)
//   // console.log('Unregister key:', transKey)
//   globalShortcut.unregister(transKey)
//   hotKeyState.state.delete(key)
// }

export const unRegisterHotkeyAll = () => {
  hotKeyState.state.clear()
  globalShortcut.unregisterAll()
}

const handleRegisterHotkey = (key: string) => {
  let ret = registerHotkey(key)
  if (!ret) log.info('Register hot key failed:', key)
}

export const init = () => {
  unRegisterHotkeyAll()
  if (!hotKeyState.config.global.enable) return
  // state.state = {}
  // console.log(state.config.global.keys)
  for (const key of Object.keys(hotKeyState.config.global.keys)) {
    try {
      handleRegisterHotkey(key)
    } catch (err) {
      log.info(err)
    }
  }
}
