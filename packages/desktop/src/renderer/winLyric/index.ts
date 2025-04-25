import { APP_EVENT_NAMES } from '@any-listen/common/constants'
import initRendererEvent, { sendMainWindowInitedEvent } from './rendererEvent'
import { setLrcConfig } from './config'
import { closeWindow, createWindow, isExistWindow, sendEvent } from './main'
import { winMainEvent } from '../winMain'
import { appEvent, appState, updateSetting } from '@/app'
import { HOTKEY_DESKTOP_LYRIC, hotKeyEvent, hotKeyState } from '@/modules/hotKey'
import { themeEvent } from '@/modules/theme'
import { THEME_RENDERER_EVENT_NAME } from '@/shared/ipcNames'
// import main from './main'
// import { Event, EVENT_NAMES } from './event'

let isMainWidnowFullscreen = false

export const initWinLyric = () => {
  initRendererEvent()
  themeEvent.on('theme_change', (theme) => {
    sendEvent(THEME_RENDERER_EVENT_NAME.theme_change, theme)
  })

  winMainEvent.on('inited', () => {
    isMainWidnowFullscreen = appState.appSetting['common.startInFullscreen']

    if (appState.appSetting['desktopLyric.enable']) {
      if (appState.appSetting['desktopLyric.fullscreenHide'] && isMainWidnowFullscreen) {
        closeWindow()
      } else {
        if (isExistWindow()) sendMainWindowInitedEvent()
        else createWindow()
      }
    }
  })
  appEvent.on('updated_config', (keys, setting) => {
    setLrcConfig(keys, setting)
    if (keys.includes('desktopLyric.fullscreenHide') && appState.appSetting['desktopLyric.enable'] && isMainWidnowFullscreen) {
      if (appState.appSetting['desktopLyric.fullscreenHide']) closeWindow()
      else if (!isExistWindow()) createWindow()
    }
  })
  winMainEvent.on('close', () => {
    closeWindow()
  })
  winMainEvent.on('fullscreen', (isFullscreen) => {
    isMainWidnowFullscreen = isFullscreen
    if (appState.appSetting['desktopLyric.enable'] && appState.appSetting['desktopLyric.fullscreenHide']) {
      if (isFullscreen) closeWindow()
      else if (!isExistWindow()) createWindow()
    }
  })

  hotKeyEvent.on('hot_key_down', ({ type, key }) => {
    let info = hotKeyState.config.global.keys[key]
    if (!info || info.type != APP_EVENT_NAMES.winLyricName) return
    let newSetting: Partial<AnyListen.AppSetting> = {}
    let settingKey: keyof AnyListen.AppSetting
    switch (info.action) {
      case HOTKEY_DESKTOP_LYRIC.toggle_visible.action:
        settingKey = 'desktopLyric.enable'
        break
      case HOTKEY_DESKTOP_LYRIC.toggle_lock.action:
        settingKey = 'desktopLyric.isLock'
        break
      case HOTKEY_DESKTOP_LYRIC.toggle_always_top.action:
        settingKey = 'desktopLyric.isAlwaysOnTop'
        break
      default:
        return
    }
    newSetting[settingKey] = !appState.appSetting[settingKey]

    updateSetting(newSetting)
  })
}
export * from './main'
export * from './rendererEvent'

// export {
//   EVENT_NAMES,
// }
