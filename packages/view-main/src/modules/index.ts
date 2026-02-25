import { initI18n } from '@/plugins/i18n'
import { connectIPC as _connectIPC } from '@/shared/ipc/ipc'

import { initApp } from './app/init'
import { sendConnectFailed, sendConnected, sendDesconnected, sendRelease } from './app/store/action'
import { initDislikeList } from './dislikeList/init'
import { initExtension } from './extension/init'
import { initHotkey } from './hotkey/init'
import { initLyric } from './lyric/init'
import { initMusicLibrary } from './musicLibrary/init'
import { initPlayer } from './player/init'
import { initSetting } from './setting/init'
import { initTheme } from './theme/init'
import { initVersion } from './version/init'

export const registerModules = () => {
  initApp()
  initSetting()
  initTheme()
  initI18n()
  initMusicLibrary()
  initPlayer()
  initLyric()
  initDislikeList()
  initExtension()
  initHotkey()
  initVersion()
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
    },
    () => {
      sendRelease()
      console.log('logout')
      // setInited(false)
      // setShowLogin(true)
    },
    pwd
  )
}
