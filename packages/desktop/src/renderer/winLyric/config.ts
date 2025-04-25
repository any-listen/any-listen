import { isLinux } from '@any-listen/nodejs/index'
import {
  closeWindow,
  createWindow,
  getBounds,
  isExistWindow,
  alwaysOnTopTools,
  setBounds,
  setIgnoreMouseEvents,
  setSkipTaskbar,
} from './main'
import { sendConfigChange } from './rendererEvent'
import { buildLyricConfig, getLyricWindowBounds, initWindowSize, watchConfigKeys } from './utils'
import { appState } from '@/app'

let isLock: boolean
let isEnable: boolean
let isAlwaysOnTop: boolean
let isAlwaysOnTopLoop: boolean
let isShowTaskbar: boolean
let isLockScreen: boolean
let isHoverHide: boolean

export const setLrcConfig = (keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) => {
  if (!watchConfigKeys.some((key) => keys.includes(key))) return

  if (isExistWindow()) {
    sendConfigChange(...buildLyricConfig(setting))
    if (keys.includes('desktopLyric.isLock') && isLock != appState.appSetting['desktopLyric.isLock']) {
      isLock = appState.appSetting['desktopLyric.isLock']
      if (appState.appSetting['desktopLyric.isLock']) {
        setIgnoreMouseEvents(true, { forward: !isLinux && appState.appSetting['desktopLyric.isHoverHide'] })
      } else {
        setIgnoreMouseEvents(false, { forward: !isLinux && appState.appSetting['desktopLyric.isHoverHide'] })
      }
    }
    if (keys.includes('desktopLyric.isHoverHide') && isHoverHide != appState.appSetting['desktopLyric.isHoverHide']) {
      isHoverHide = appState.appSetting['desktopLyric.isHoverHide']
      if (!isLinux) {
        setIgnoreMouseEvents(appState.appSetting['desktopLyric.isLock'], {
          forward: appState.appSetting['desktopLyric.isHoverHide'],
        })
      }
    }
    if (keys.includes('desktopLyric.isAlwaysOnTop') && isAlwaysOnTop != appState.appSetting['desktopLyric.isAlwaysOnTop']) {
      isAlwaysOnTop = appState.appSetting['desktopLyric.isAlwaysOnTop']
      alwaysOnTopTools.setAlwaysOnTop(appState.appSetting['desktopLyric.isAlwaysOnTopLoop'])
      if (isAlwaysOnTop && appState.appSetting['desktopLyric.isAlwaysOnTopLoop']) {
        alwaysOnTopTools.startLoop()
      } else alwaysOnTopTools.clearLoop()
    }
    if (keys.includes('desktopLyric.isShowTaskbar') && isShowTaskbar != appState.appSetting['desktopLyric.isShowTaskbar']) {
      isShowTaskbar = appState.appSetting['desktopLyric.isShowTaskbar']
      setSkipTaskbar(!appState.appSetting['desktopLyric.isShowTaskbar'])
    }
    if (
      keys.includes('desktopLyric.isAlwaysOnTopLoop') &&
      isAlwaysOnTopLoop != appState.appSetting['desktopLyric.isAlwaysOnTopLoop']
    ) {
      isAlwaysOnTopLoop = appState.appSetting['desktopLyric.isAlwaysOnTopLoop']
      if (!appState.appSetting['desktopLyric.isAlwaysOnTop']) return
      if (isAlwaysOnTopLoop) {
        alwaysOnTopTools.startLoop()
      } else {
        alwaysOnTopTools.clearLoop()
      }
    }
    if (keys.includes('desktopLyric.isLockScreen') && isLockScreen != appState.appSetting['desktopLyric.isLockScreen']) {
      isLockScreen = appState.appSetting['desktopLyric.isLockScreen']
      if (appState.appSetting['desktopLyric.isLockScreen']) {
        setBounds(
          getLyricWindowBounds(getBounds(), {
            x: 0,
            y: 0,
            w: appState.appSetting['desktopLyric.width'],
            h: appState.appSetting['desktopLyric.height'],
          })
        )
      }
    }
    if (keys.includes('desktopLyric.x') && setting['desktopLyric.x'] == null) {
      setBounds(
        initWindowSize(
          appState.appSetting['desktopLyric.x'],
          appState.appSetting['desktopLyric.y'],
          appState.appSetting['desktopLyric.width'],
          appState.appSetting['desktopLyric.height']
        )
      )
    }
  }
  if (keys.includes('desktopLyric.enable') && isEnable != appState.appSetting['desktopLyric.enable']) {
    isEnable = appState.appSetting['desktopLyric.enable']
    if (appState.appSetting['desktopLyric.enable']) {
      createWindow()
    } else {
      alwaysOnTopTools.clearLoop()
      closeWindow()
    }
  }
}
