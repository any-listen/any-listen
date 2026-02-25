import { winMainReadyEvent } from '@any-listen/app/common/event'
import { APP_EVENT_NAMES } from '@any-listen/common/constants'
import { isMac } from '@any-listen/nodejs/index'

// import { initMainWindowHandler as initMainWindowHandlerUserApi } from '@/modules/userApi'
// import { initMainWindowHandler as initMainWindowHandlerSync } from '@/modules/sync'
import { actions } from '@/actions'
// import initUpdate from './autoUpdate'
import { appEvent } from '@/app'
import { extensionEvent } from '@/modules/extension'
import { hotKeyEvent, hotKeyState } from '@/modules/hotKey'
import { playerEvent } from '@/modules/player'
import { themeEvent } from '@/modules/theme'
import { initMainWindowHandler as initMainWindowHandlerTray } from '@/modules/tray'

import { initUpdate } from './autoUpdate'
import { winMainEvent } from './event'
import {
  createWindow,
  getWebContents,
  isExistWindow,
  isShowWindow,
  minimize,
  setWindowBounds,
  showWindow,
  toggleHide,
  toggleMinimize,
} from './main'
import { init as initRendererEvent, rendererIPC } from './rendererEvent'
import { initTaskProgress } from './taskProgress'
import { initThumbarButtons } from './thumbarButtons'
import { getWindowSizeInfo } from './utils'

export const initWinMain = () => {
  initRendererEvent((name, data) => {
    getWebContents()?.send(name, data)
  })
  // initUpdate()
  if (process.env.NODE_ENV === 'production') initUpdate()
  initMainWindowHandlerTray(winMainEvent, isExistWindow, isShowWindow)
  // initMainWindowHandlerUserApi(winMainEvent)
  // initMainWindowHandlerSync(winMainEvent)

  appEvent.on('updated_config', (keys, setting) => {
    void rendererIPC.settingChanged(keys, setting)

    if (keys.includes('common.windowSizeId')) {
      const windowSizeInfo = getWindowSizeInfo(setting['common.windowSizeId']!)
      setWindowBounds({ width: windowSizeInfo.width, height: windowSizeInfo.height })
    }
  })
  appEvent.on('inited', createWindow)
  appEvent.on('second_instance', (deeplink) => {
    if (isExistWindow()) {
      if (deeplink) void rendererIPC.deeplink(deeplink)
      else showWindow()
    } else if (isMac) createWindow()
    else actions.exec('app.quit')
  })
  appEvent.on('activate', () => {
    if (isExistWindow()) {
      showWindow()
    } else {
      createWindow()
    }
  })
  winMainEvent.on('inited', () => {
    winMainReadyEvent.emit()
  })
  winMainEvent.on('hide', () => {
    void rendererIPC.winShow(false)
  })
  winMainEvent.on('show', () => {
    void rendererIPC.winShow(true)
  })
  themeEvent.on('theme_change', (theme) => {
    void rendererIPC.themeChanged(theme)
  })
  themeEvent.on('theme_list_change', (list) => {
    void rendererIPC.themeListChanged(list)
  })

  hotKeyEvent.on('hot_key_down', ({ type, key }) => {
    let action = hotKeyState.config.global.keys[key]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!action || action.startsWith(APP_EVENT_NAMES.viewMainName) || action.startsWith(APP_EVENT_NAMES.playerName)) return
    switch (action) {
      case 'view_main_toggle_close':
        actions.exec('app.quit')
        break
      case 'view_main_toggle_hide':
        toggleHide()
        break
      case 'view_main_min':
        minimize()
        break
      case 'view_main_toggle_min':
        toggleMinimize()
        break
      default:
        void rendererIPC.hotKeyDown({ type, key })
        break
    }
  })
  hotKeyEvent.on('hot_key_config_update', (config) => {
    void rendererIPC.hotKeyConfigUpdated(config)
  })
  extensionEvent.on('extensionEvent', (event) => {
    void rendererIPC.extensionEvent(event)
  })
  playerEvent.on('collectStatus', (status) => {
    void rendererIPC.playerAction({ action: 'collectStatus', data: status })
  })

  // initUpdate()
  initTaskProgress()
  initThumbarButtons()
  // playerEvent.on('progress', (progress) => {

  // })

  // syncEvent.on('server_status_changed', sendServerStatus)
  // syncEvent.on('client_status_changed', sendClientStatus)
}
