import { winLyricReadyEvent } from '@any-listen/app/common/event'
import { IPC_CHANNEL_NAMES } from '@any-listen/common/constants'
import { MessageChannelMain } from 'electron'

// import initUpdate from './autoUpdate'
import { appEvent, appState } from '@/app'

import { winMainEvent } from '../winMain'
import { sendWinLyricChannelPort } from '../winMain/actions'
import { winMainState } from '../winMain/state'
import { handleConfigUpdated, initState } from './config'
import { winLyricEvent } from './event'
import { closeWindow, createWindow, getWebContents, isExistWindow } from './main'
import { init as initRendererEvent } from './rendererEvent'

export const initWinLyric = () => {
  initRendererEvent((name, data) => {
    getWebContents()?.send(name, data)
  })

  winMainEvent.on('inited', () => {
    if (appState.appSetting['desktopLyric.enable'] && !winMainState.isFullScreen) {
      createWindow()
    }
  })
  winMainEvent.on('close', () => {
    closeWindow()
  })
  winMainEvent.on('fullscreen', (isFullscreen) => {
    if (isFullscreen) {
      closeWindow()
    } else if (appState.appSetting['desktopLyric.enable']) {
      createWindow()
    }
  })

  appEvent.on('updated_config', (keys, setting) => {
    if (keys.includes('desktopLyric.fullscreenHide') && appState.appSetting['desktopLyric.enable'] && winMainState.isFullScreen) {
      if (appState.appSetting['desktopLyric.fullscreenHide']) closeWindow()
      else if (!isExistWindow()) createWindow()
    }
    handleConfigUpdated(keys, setting)
  })
  winLyricEvent.on('inited', () => {
    winLyricReadyEvent.emit()
    const { port1, port2 } = new MessageChannelMain()
    void sendWinLyricChannelPort(port1)
    getWebContents()?.postMessage(IPC_CHANNEL_NAMES.WIN_MAIN_CHANNEL_PORT, null, [port2])
  })

  initState()
}
