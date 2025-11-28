// import { createUnsubscriptionSet } from '@/shared'
import { setTitle } from '@/shared'
import { keyboardEvent } from '../hotkey/keyboard'
import { lyricEvent } from '../lyric/store/event'
import { playerEvent } from '../player/store/event'
import { playerState } from '../player/store/state'
import { settingEvent } from '../setting/store/event'
import { settingState } from '../setting/store/state'
import { onConnected, onRelease } from './shared'
import { getMachineId, sendInitedEvent, setMachineId, setWorkerInitPromise } from './store/action'
import { appEvent } from './store/event'

const init = async () => {
  const machineId = await getMachineId()
  setMachineId(machineId)
}
// let unregistereds = createUnsubscriptionSet()
export const initApp = () => {
  // onRelease(unregistereds.clear.bind(unregistereds))
  onConnected(() => {
    void init()
  })
  settingEvent.on('inited', () => {
    // unregistereds.register((subscriptions) => {})
    void sendInitedEvent()
  })
  let mainWorkerResolve: () => void
  setWorkerInitPromise(
    new Promise((resolve) => {
      mainWorkerResolve = resolve
    })
  )
  window.addEventListener('worker-initialized-main', mainWorkerResolve!)
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
  if (import.meta.env.VITE_IS_WEB) {
    onRelease(() => {
      document.body.style.removeProperty('position')
      document.body.style.removeProperty('width')
      document.body.style.removeProperty('height')
      document.body.style.removeProperty('left')
      document.body.style.removeProperty('top')
      document.documentElement.style.fontSize = '16px'
      document.body.classList.remove('no-animation')
    })
  }
}
