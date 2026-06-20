// import { getSystemThemeIsDark, onSystemThemeModeChanged } from '@any-listen/web'
// import { createUnsubscriptionSet } from '@/shared'

import { settingEvent } from '../setting/store/event'
import { onConnected } from './shared'
import { sendInitedEvent } from './store/action'
import { appEvent } from './store/event'
// import { appState } from './store/state'

// let systemThemeModeChangedUnregister: (() => void) | null = null
// const init = async () => {
//   if (import.meta.env.VITE_IS_WEB) {
//     systemThemeModeChangedUnregister = onSystemThemeModeChanged((isDark) => {
//       // void setSystemThemeMode(isDark)
//     })
//     // initWindowInfo()
//   }
// }
// let unregistereds = createUnsubscriptionSet()
export const initApp = () => {
  // onRelease(unregistereds.clear.bind(unregistereds))
  onConnected(() => {
    // void init()
    void sendInitedEvent()
  })
  settingEvent.on('inited', async () => {
    // unregistereds.register((subscriptions) => {})
    if (import.meta.env.VITE_IS_WEB) {
      // void setSystemThemeMode(getSystemThemeIsDark())
    }
  })
  // let mainWorkerResolve: () => void
  // setWorkerInitPromise(
  //   new Promise((resolve) => {
  //     mainWorkerResolve = resolve
  //   })
  // )
  // window.addEventListener('worker-initialized-main', mainWorkerResolve!)

  document.documentElement.addEventListener(
    'contextmenu',
    (event) => {
      event.preventDefault()
    },
    {
      capture: true,
    }
  )
  window.addEventListener('focus', () => {
    appEvent.focus()
  })
  window.addEventListener('blur', () => {
    appEvent.blur()
  })
  window.addEventListener('visibilitychange', () => {
    appEvent.visible(!document.hidden)
  })
}
