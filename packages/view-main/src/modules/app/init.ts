// import { createUnsubscriptionSet } from '@/shared'
import { setTitle } from '@/shared'
import { getSystemThemeIsDark, onSystemThemeModeChanged } from '@/shared/browser/tools'
import { handleConfigChange, handleRelease, initWindowInfo } from '@/shared/browser/widnow.svelte'
import { setSystemThemeMode } from '@/shared/ipc/app'
import { keyboardEvent } from '../hotkey/keyboard'
import { lyricEvent } from '../lyric/store/event'
import { playerEvent } from '../player/store/event'
import { playerState } from '../player/store/state'
import { settingEvent } from '../setting/store/event'
import { settingState } from '../setting/store/state'
import { onConnected, onRelease } from './shared'
import { getMachineId, sendInitedEvent, setFullScreen, setMachineId, setWorkerInitPromise } from './store/action'
import { appEvent } from './store/event'
import { appState } from './store/state'

let systemThemeModeChangedUnregister: (() => void) | null = null
const init = async () => {
  const machineId = await getMachineId()
  setMachineId(machineId)
  if (import.meta.env.VITE_IS_WEB) {
    systemThemeModeChangedUnregister = onSystemThemeModeChanged((isDark) => {
      void setSystemThemeMode(isDark)
    })
    initWindowInfo()
  }
}
// let unregistereds = createUnsubscriptionSet()
export const initApp = () => {
  // onRelease(unregistereds.clear.bind(unregistereds))
  onConnected(() => {
    void init()
  })
  settingEvent.on('inited', async () => {
    // unregistereds.register((subscriptions) => {})
    await sendInitedEvent()
    void setSystemThemeMode(getSystemThemeIsDark())
  })
  let mainWorkerResolve: () => void
  setWorkerInitPromise(
    new Promise((resolve) => {
      mainWorkerResolve = resolve
    })
  )
  window.addEventListener('worker-initialized-main', mainWorkerResolve!)
  appEvent.on('fullscreen', (isFullscreen) => {
    if (isFullscreen) {
      document.documentElement.classList.add('fullscreen')
    } else {
      document.documentElement.classList.remove('fullscreen')
    }
  })
  lyricEvent.on('titleLyricChanged', (text) => {
    if (!settingState.setting['player.isShowTitleLyric']) return
    if (text == null) {
      setTitle(playerState.title)
    } else {
      setTitle(text)
    }
  })
  playerEvent.on('titleChanged', (title) => {
    setTitle(title)
  })
  settingEvent.on('updated', (keys, settings) => {
    if (keys.includes('player.isShowTitleLyric')) {
      if (!settings['player.isShowTitleLyric']) {
        setTitle(playerState.title)
      }
    }
    if (import.meta.env.VITE_IS_DESKTOP) {
      // this setting only works on desktop
      if (keys.includes('common.startInFullscreen')) {
        setFullScreen(settings['common.startInFullscreen'] || false)
      }
    }
    if (import.meta.env.VITE_IS_WEB) handleConfigChange(keys, settings)
  })

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
  keyboardEvent.on('mod+a_down', (evt) => {
    if (evt.inputing) return
    evt.event?.preventDefault()
  })
  if (import.meta.env.VITE_IS_DESKTOP) {
    keyboardEvent.on('f11_down', (evt) => {
      if (evt.inputing || evt.event?.repeat) return
      evt.event?.preventDefault()
      setFullScreen(!appState.isFullscreen)
    })
    keyboardEvent.on('escape_down', (evt) => {
      if (evt.inputing || evt.event?.repeat || !appState.isFullscreen) return
      evt.event?.preventDefault()
      setFullScreen(false)
    })
  }
  if (import.meta.env.VITE_IS_WEB) {
    onRelease(() => {
      handleRelease()
      systemThemeModeChangedUnregister?.()
      systemThemeModeChangedUnregister = null
      document.documentElement.style.fontSize = '16px'
      document.body.classList.remove('no-animation')
    })
  }
}
