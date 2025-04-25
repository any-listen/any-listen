import { mainOn, mainHandle } from '@/shared/mainIpc'
import { WIN_LYRIC_RENDERER_EVENT_NAME } from '@/shared/ipcNames'
import { buildLyricConfig, getLyricWindowBounds } from './utils'
import { sendNewDesktopLyricClient } from '@/renderer/winMain'
import { getBounds, getMainFrame, sendEvent, setBounds } from './main'
import { MessageChannelMain } from 'electron'
import { appState, updateSetting } from '@/app'

export default () => {
  mainHandle<Partial<AnyListen.AppSetting>>(WIN_LYRIC_RENDERER_EVENT_NAME.set_config, async ({ params: config }) => {
    updateSetting(config)
  })

  mainHandle<AnyListen.DesktopLyric.Config>(WIN_LYRIC_RENDERER_EVENT_NAME.get_config, async () => {
    return buildLyricConfig(appState.appSetting)[1] as AnyListen.DesktopLyric.Config
  })

  mainOn<AnyListen.DesktopLyric.NewBounds>(WIN_LYRIC_RENDERER_EVENT_NAME.set_win_bounds, ({ params: options }) => {
    setBounds(getLyricWindowBounds(getBounds(), options))
  })

  mainOn(WIN_LYRIC_RENDERER_EVENT_NAME.request_main_window_channel, ({ event }) => {
    if (event.senderFrame !== getMainFrame()) return
    // Create a new channel ...
    const { port1, port2 } = new MessageChannelMain()
    // ... send one end to the worker ...
    sendNewDesktopLyricClient(port1)
    // ... and the other end to the main window.
    event.senderFrame.postMessage(WIN_LYRIC_RENDERER_EVENT_NAME.provide_main_window_channel, null, [port2])
    // Now the main window and the worker can communicate with each other
    // without going through the main process!
    console.log('request_main_window_channel')
  })
}

export const sendConfigChange = (
  keys: Array<keyof AnyListen.DesktopLyric.Config>,
  setting: Partial<AnyListen.DesktopLyric.Config>
) => {
  sendEvent(WIN_LYRIC_RENDERER_EVENT_NAME.on_config_change, { keys, setting })
}

export const sendMainWindowInitedEvent = () => {
  sendEvent(WIN_LYRIC_RENDERER_EVENT_NAME.main_window_inited)
}
