import { appState } from '@/app'
import { isLinux } from '@/shared/utils'

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
import { mouseCheckTools } from './mouseCheckTools'
import { rendererIPC } from './rendererEvent'
import { winLyricState } from './state'
import { getLyricWindowBounds, initWindowSize } from './utils'

export const handleConfigUpdated = (keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) => {
  if (!keys.some((key) => key.startsWith('desktopLyric.'))) return

  if (isExistWindow()) {
    if (keys.includes('desktopLyric.isLock') && winLyricState.isLock != setting['desktopLyric.isLock']!) {
      winLyricState.isLock = setting['desktopLyric.isLock']!
      if (winLyricState.isLock) {
        setIgnoreMouseEvents(true, { forward: !isLinux && winLyricState.isHoverHide })
        mouseCheckTools.runCheck(() => {
          void rendererIPC.mouseLeave()
        })
      } else {
        setIgnoreMouseEvents(false, { forward: !isLinux && winLyricState.isHoverHide })
        mouseCheckTools.cacnelCheck()
      }
    }
    if (keys.includes('desktopLyric.isHoverHide') && winLyricState.isHoverHide != setting['desktopLyric.isHoverHide']!) {
      winLyricState.isHoverHide = setting['desktopLyric.isHoverHide']!
      if (!isLinux) {
        setIgnoreMouseEvents(winLyricState.isLock, { forward: winLyricState.isHoverHide })
        if (winLyricState.isHoverHide) {
          mouseCheckTools.runCheck(() => {
            void rendererIPC.mouseLeave()
          })
        } else {
          mouseCheckTools.cacnelCheck()
        }
      }
    }
    if (keys.includes('desktopLyric.isAlwaysOnTop') && winLyricState.isAlwaysOnTop != setting['desktopLyric.isAlwaysOnTop']!) {
      winLyricState.isAlwaysOnTop = setting['desktopLyric.isAlwaysOnTop']!
      alwaysOnTopTools.setAlwaysOnTop(winLyricState.isAlwaysOnTopLoop)
      if (winLyricState.isAlwaysOnTop && winLyricState.isAlwaysOnTopLoop) {
        alwaysOnTopTools.startLoop()
      } else alwaysOnTopTools.clearLoop()
    }
    if (keys.includes('desktopLyric.isShowTaskbar') && winLyricState.isShowTaskbar != setting['desktopLyric.isShowTaskbar']!) {
      winLyricState.isShowTaskbar = setting['desktopLyric.isShowTaskbar']!
      setSkipTaskbar(!winLyricState.isShowTaskbar)
    }
    if (
      keys.includes('desktopLyric.isAlwaysOnTopLoop') &&
      winLyricState.isAlwaysOnTopLoop != setting['desktopLyric.isAlwaysOnTopLoop']!
    ) {
      winLyricState.isAlwaysOnTopLoop = setting['desktopLyric.isAlwaysOnTopLoop']!
      if (!winLyricState.isAlwaysOnTop) return
      if (winLyricState.isAlwaysOnTopLoop) {
        alwaysOnTopTools.startLoop()
      } else {
        alwaysOnTopTools.clearLoop()
      }
    }
    if (keys.includes('desktopLyric.isLockScreen') && winLyricState.isLockScreen != setting['desktopLyric.isLockScreen']!) {
      winLyricState.isLockScreen = setting['desktopLyric.isLockScreen']!
      if (winLyricState.isLockScreen) {
        setBounds(
          getLyricWindowBounds(getBounds()!, {
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
  if (keys.includes('desktopLyric.enable') && winLyricState.enabled != setting['desktopLyric.enable']!) {
    winLyricState.enabled = setting['desktopLyric.enable']!
    if (setting['desktopLyric.enable']!) {
      createWindow()
    } else {
      alwaysOnTopTools.clearLoop()
      mouseCheckTools.cacnelCheck()
      closeWindow()
    }
  }
}

export const initState = () => {
  winLyricState.enabled = appState.appSetting['desktopLyric.enable']
  winLyricState.isLock = appState.appSetting['desktopLyric.isLock']
  winLyricState.isAlwaysOnTop = appState.appSetting['desktopLyric.isAlwaysOnTop']
  winLyricState.isAlwaysOnTopLoop = appState.appSetting['desktopLyric.isAlwaysOnTopLoop']
  winLyricState.isShowTaskbar = appState.appSetting['desktopLyric.isShowTaskbar']
  winLyricState.isLockScreen = appState.appSetting['desktopLyric.isLockScreen']
  winLyricState.isHoverHide = appState.appSetting['desktopLyric.isHoverHide']
}
