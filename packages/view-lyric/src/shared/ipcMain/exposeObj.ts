import { playerEvent, settingChangedEvent, themeChangedEvent } from './event'

export const exposeObj: AnyListen.IPCWinLyricActions.IPCWinLyricActions = {
  async ping() {},
  async settingChanged(keys, setting) {
    settingChangedEvent.emit(keys, setting)
  },
  async themeChanged(theme) {
    themeChangedEvent.emit(theme)
  },
  async playerEvent(event) {
    playerEvent.emit(event)
  },
}
