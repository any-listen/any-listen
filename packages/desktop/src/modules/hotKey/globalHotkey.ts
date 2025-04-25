import { globalShortcut } from 'electron'
import { log } from '@/shared/log'
import { hotKeyEvent, hotKeyState } from '@any-listen/app/modules/hotkey'
import type { HOTKEY_Type } from '@any-listen/common/hotKey'

export const handleKeyDown = (key: string) => {
  if (hotKeyState.tempDisable) return
  hotKeyEvent.hot_key_down({ type: 'global', key })
}

const transformedKeyRxp = /(^|\+)[a-z]/g

export const transformedKey = (key: string): string => {
  if (key.includes('arrow')) key = key.replace(/arrow/g, '')
  return key.replace('mod', 'CommandOrControl').replace(transformedKeyRxp, (l) => l.toUpperCase())
}

export const registerHotkey = ({ key, info }: AnyListen.HotKey.RegisterKeyInfo<HOTKEY_Type>): boolean => {
  let targetKey = hotKeyState.state.get(key)
  if (targetKey?.status) return true
  const transKey = transformedKey(key)
  // console.log('Register key:', transKey)
  if (targetKey) {
    targetKey.info = info
  } else {
    targetKey = {
      status: false,
      info,
    }
    hotKeyState.state.set(key, targetKey)
  }
  const status = (targetKey.status = globalShortcut.isRegistered(transKey)
    ? false
    : globalShortcut.register(transKey, () => {
        handleKeyDown(key)
      }))
  return status
}

export const unRegisterHotkey = (key: string) => {
  let transKey = transformedKey(key)
  // console.log('Unregister key:', transKey)
  globalShortcut.unregister(transKey)
  hotKeyState.state.delete(key)
}

export const unRegisterHotkeyAll = () => {
  hotKeyState.state.clear()
  globalShortcut.unregisterAll()
}

const handleRegisterHotkey = (data: AnyListen.HotKey.RegisterKeyInfo<HOTKEY_Type>) => {
  let ret = registerHotkey(data)
  if (!ret) log.info('Register hot key failed:', data.key)
}

export const init = (isForce = false) => {
  unRegisterHotkeyAll()
  if (!isForce && !hotKeyState.config.global.enable) return
  // state.state = {}
  // console.log(state.config.global.keys)
  for (const key of Object.keys(hotKeyState.config.global.keys)) {
    try {
      handleRegisterHotkey({ key, info: hotKeyState.config.global.keys[key] })
    } catch (err) {
      log.info(err)
    }
  }
}
