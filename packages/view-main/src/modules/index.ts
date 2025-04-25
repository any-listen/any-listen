import { connectIPC as _connectIPC } from '@/shared/ipc/ipc'
import { initI18n } from '@/plugins/i18n'
import { sendConnectFailed, sendConnected, sendDesconnected, sendRelease } from './app/store/action'
import { initApp } from './app/init'
import { initVersion } from './version/init'
import { initSetting } from './setting/init'
import { initTheme } from './theme/init'
import { initPlayer } from './player/init'
import { initLyric } from './lyric/init'
import { initDislikeList } from './dislikeList/init'
import { initExtension } from './extension/init'
import { initMusicLibrary } from './musicLibrary/init'
import { initHotkey } from './hotkey/init'

export const registerModules = () => {
  initApp()
  initVersion()
  initTheme()
  initSetting()
  initI18n()
  initMusicLibrary()
  initPlayer()
  initLyric()
  initDislikeList()
  initExtension()
  initHotkey()
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
