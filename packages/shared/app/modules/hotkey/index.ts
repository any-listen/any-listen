import { hotKeyEvent } from './event'
import { hotKeyState } from './state'

export const getHotKeyConfig = () => {
  return {
    local: hotKeyState.config.local,
    global: hotKeyState.config.global,
  }
}

export const getHotkeyStatus = () => {
  return hotKeyState.state
}

export { hotKeyState, hotKeyEvent }
