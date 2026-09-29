import { winMainReadyEvent } from '@any-listen/app/common/event'
import { commandEvent } from '@any-listen/app/modules/command/event'
import { appLogEvent } from '@any-listen/app/modules/logs'

// import { initMainWindowHandler as initMainWindowHandlerUserApi } from '@/modules/userApi'
// import { initMainWindowHandler as initMainWindowHandlerSync } from '@/modules/sync'
import { actions } from '@/actions'
// import initUpdate from './autoUpdate'
import { appEvent } from '@/app'
import { quit } from '@/app/actions'
import { extensionEvent } from '@/modules/extension'
import { hotKeyEvent } from '@/modules/hotKey'
import { playerEvent } from '@/modules/player'
import { onWebDAVSyncStatusChanged } from '@/modules/sync'
import { themeEvent } from '@/modules/theme'
import { initMainWindowHandler as initMainWindowHandlerTray } from '@/modules/tray'
import { exitApp } from '@/shared/electron'

import { initUpdate } from './autoUpdate'
import { winMainEvent } from './event'
import {
  closeWindow,
  createWindow,
  getWebContents,
  hideWindow,
  isExistWindow,
  isShowWindow,
  minimize,
  setFullScreen,
  setWindowBounds,
  showWindow,
  toggleHide,
} from './main'
import { init as initRendererEvent, rendererIPC } from './rendererEvent'
import { winMainState } from './state'
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

    if (keys.includes('common.windowSizeId') && !winMainState.isFullScreen) {
      const windowSizeInfo = getWindowSizeInfo(setting['common.windowSizeId']!)
      setWindowBounds({ width: windowSizeInfo.width, height: windowSizeInfo.height })
    }
  })
  appEvent.on('inited', createWindow)
  appEvent.on('second_instance', (deeplink) => {
    if (isExistWindow()) {
      if (deeplink) void rendererIPC.deeplink(deeplink)
      else showWindow()
    } else if (import.meta.env.VITE_IS_MAC) createWindow()
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
  winMainEvent.on('fullscreen', (isFullscreen) => {
    void rendererIPC.fullscreen(isFullscreen)
  })
  themeEvent.on('theme_change', (theme) => {
    void rendererIPC.themeChanged(theme)
  })
  themeEvent.on('theme_list_change', (list) => {
    void rendererIPC.themeListChanged(list)
  })

  commandEvent.register('viewMainCommand', async (command, ...args) => {
    return rendererIPC.executeCommand(command, args)
  })
  commandEvent.register('minimize', async () => {
    minimize()
  })
  commandEvent.register('fullscreenToggle', async (fullscreen?: boolean) => {
    setFullScreen(fullscreen ?? !winMainState.isFullScreen)
  })
  commandEvent.register('close', async (isForce) => {
    if (isForce) {
      exitApp(0)
      return
    }
    closeWindow()
  })
  commandEvent.register('exit', async () => {
    quit()
  })
  commandEvent.register('hide', async () => {
    hideWindow()
  })
  commandEvent.register('show', async () => {
    showWindow()
  })
  commandEvent.register('hideToggle', async () => {
    toggleHide()
  })

  hotKeyEvent.on('config_updated', (config) => {
    void rendererIPC.hotKeyConfigUpdated(config)
  })
  hotKeyEvent.on('enable_chenged', (config) => {
    void rendererIPC.hotKeyEnabled(config)
  })
  extensionEvent.on('extensionEvent', (event) => {
    void rendererIPC.extensionEvent(event)
  })
  playerEvent.on('collectStatus', (status) => {
    void rendererIPC.playerAction({ action: 'collectStatus', data: status })
  })
  appLogEvent.on('logOutput', (type, log) => {
    void rendererIPC.appLog(type, log)
  })
  onWebDAVSyncStatusChanged((state) => {
    void rendererIPC.webdavSyncStatus(state)
  })

  // initUpdate()
  initTaskProgress()
  initThumbarButtons()
  // playerEvent.on('progress', (progress) => {

  // })

  // syncEvent.on('server_status_changed', sendServerStatus)
  // syncEvent.on('client_status_changed', sendClientStatus)
}
