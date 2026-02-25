import { onBlur, onConnected, onFocus, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { clearDownKeys, registerKeyEvent } from './keyboard'
// import { applyTheme, getThemeSetting, registerRemoteThemeAction } from './store/action'
// import { updateTheme } from './store/commit'

const unregistered = createUnsubscriptionSet()
export const initHotkey = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerKeyEvent())
      subscriptions.add(onFocus(clearDownKeys))
      subscriptions.add(onBlur(clearDownKeys))
    })
  })
}
