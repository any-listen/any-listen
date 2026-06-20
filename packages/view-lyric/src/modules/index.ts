import { initI18n } from '@/plugins/i18n'
import { connectIPC as _connectIPC } from '@/shared/ipc/ipc'

import { initApp } from './app/init'
import { sendConnectFailed, sendConnected, sendDesconnected } from './app/store/action'
import { initLyric } from './lyric/init'
import { initPlayer } from './player/init'
import { initSetting } from './setting/init'
import { initTheme } from './theme/init'

export const registerModules = () => {
  initApp()
  initSetting()
  initI18n()
  initTheme()
  initPlayer()
  initLyric()
}

export const connectIPC = (pwd?: string) => {
  _connectIPC(
    () => {
      console.log('connected')
      // if (appState.showLogin) setShowLogin(false)
      sendConnected()
      // setInited(true)
    },
    () => {
      sendDesconnected()
      console.log('disconnected')
    },
    (message) => {
      sendConnectFailed(message)
      // setInited(false)
      // setShowLogin(true)
      console.log('failed')
      console.log(message)
    }
  )
}
