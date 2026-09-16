import { onBlur, onConnected, onFocus, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'
import { getHotKey } from '@/shared/ipc/hotkey'
import { hotKeyDownEvent, hotKeyConfigUpdatedEvent } from '@/shared/ipc/hotkey/event'

import { registerHotkeyActions } from './actions'
import { clearDownKeys, registerKeyEvent } from './keyboard'
import { hotkeyEvent } from './store/event'
import { hotkeyState } from './store/state'
// import { applyTheme, getThemeSetting, registerRemoteThemeAction } from './store/action'
// import { updateTheme } from './store/commit'

const unregistered = createUnsubscriptionSet()
export const initHotkey = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      if (!import.meta.env.VITE_IS_WEB) {
        let active = true
        subscriptions.add(() => {
          active = false
        })
        subscriptions.add(
          hotKeyConfigUpdatedEvent.on((config) => {
            hotkeyState.config = config
          })
        )
        subscriptions.add(
          hotKeyDownEvent.on(({ type, key }) => {
            if (hotkeyState.isEditingHotKey || !hotkeyState.config[type].enable) return
            const action = hotkeyState.config[type].keys[key]
            // Stored bindings may refer to a key that has since been removed.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (action) hotkeyEvent.emit(action)
          })
        )
        subscriptions.add(registerHotkeyActions())
        void getHotKey()
          .then((config) => {
            if (active) hotkeyState.config = config
          })
          .catch(console.error)
      }
      subscriptions.add(registerKeyEvent())
      subscriptions.add(onFocus(clearDownKeys))
      subscriptions.add(onBlur(clearDownKeys))
    })
  })
}
