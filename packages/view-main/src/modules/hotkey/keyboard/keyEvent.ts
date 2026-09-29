import { executeCommand } from '@/modules/command/actions'

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
          hotkeyState.config.local.keys[key] &&
          (key != 'escape' || !(event.target as HTMLElement).classList.contains('ignore-esc'))
        ) {
          // console.log(key, eventKey, type, keys, isEditing)
          event.preventDefault()
          if (type == 'up') return

          void executeCommand(hotkeyState.config.local.keys[key])
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
