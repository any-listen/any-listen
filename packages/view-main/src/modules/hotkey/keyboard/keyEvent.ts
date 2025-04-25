import { settingState } from '@/modules/setting/store/state'
import { hotkeyEvent } from '../store/event'
import { hotkeyState } from '../store/state'
import keyBind from './keyBind'
import KeyboardEvent from './KeyboardEvent'

export const keyboardEvent = new KeyboardEvent()

export const registerKeyEvent = () => {
  keyBind.bindKey((key, eventKey, type, event, keys, inputing) => {
    // console.log(`${key}_${type}`)
    // console.log(event, key)
    const kevent = { event, keys, key, eventKey, type, inputing }
    // console.log(key, eventKey, type, event, keys)
    keyboardEvent.emitAnyKey(kevent)
    if (hotkeyState.isEditingHotKey) return
    // console.log(hotkeyState.isEditingHotKey, isEditing)
    void keyboardEvent.emit(key, kevent).then((stopped) => {
      if (stopped) return
      void keyboardEvent.emit(`${key}_${type}`, kevent).then((stopped) => {
        if (stopped) return
        if (
          event &&
          hotkeyState.config.local.enable &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          hotkeyState.config.local.keys[key] &&
          (key != 'escape' || !(event.target as HTMLElement).classList.contains('ignore-esc'))
        ) {
          // console.log(key, eventKey, type, keys, isEditing)
          event.preventDefault()
          if (type == 'up') return

          // 软件内快捷键的最小化触发时
          // 如果已启用托盘，则隐藏程序，否则最小化程序 https://github.com/lyswhut/lx-music-desktop/issues/603
          if (hotkeyState.config.local.keys[key] == 'view_main_min' && settingState.setting['tray.enable']) {
            hotkeyEvent.emit('view_main_toggle_hide')
            return
          }

          hotkeyEvent.emit(hotkeyState.config.local.keys[key])
          return
        }
        // console.log(`${key}_${type}`)
        if (key != eventKey) {
          void keyboardEvent.emit(eventKey, kevent).then((stopped) => {
            if (stopped) return
            void keyboardEvent.emit(`${eventKey}_${type}`, kevent)
          })
        }
      })
    })
  })
  return () => {
    keyBind.unbindKey()
  }
}

// export const unregisterKeyEvent = () => {
//   keyBind.unbindKey()
// }

export const clearDownKeys = () => {
  keyBind.clearDownKeys()
}
