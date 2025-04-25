import { appEvent } from '@/app/app'
import { extensionEvent } from '@/app/modules/extension'
import { hotKeyEvent } from '@/app/modules/hotKey'
import { themeEvent } from '@/app/modules/theme'
import { playerEvent } from '@any-listen/app/modules/player'
import { initUpdate } from './autoUpdate'
import { init as initRendererEvent, rendererIPC } from './rendererEvent'
// import { initUpdate } from './autoUpdate'

export const initWinMain = () => {
  initRendererEvent()
  initUpdate()

  appEvent.on('updated_config', (keys, setting) => {
    void rendererIPC.settingChanged(keys, setting)
  })
  themeEvent.on('theme_change', (theme) => {
    void rendererIPC.themeChanged(theme)
  })
  themeEvent.on('theme_list_change', (list) => {
    void rendererIPC.themeListChanged(list)
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
}
