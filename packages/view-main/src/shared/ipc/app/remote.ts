import { showMessageBox } from '@/components/apis/dialog/messageBox'
import { showInputBox } from '@/components/apis/inputModal/inputBox'
import { showNotifyBox } from '@/components/apis/notify'

import { closeMessageBoxEvent, deeplinkEvent, settingChangedEvent, updateInfoEvent, winShowEvent } from './event'

export default {
  async settingChanged(keys, setting) {
    settingChangedEvent.emit(keys, setting)
  },
  async deeplink(deeplink) {
    deeplinkEvent.emit(deeplink)
  },
  async winShow(show) {
    winShowEvent.emit(show)
  },
  async createDesktopLyricProcess() {
    // TODO
  },
  async showMessageBox(key, extId, options) {
    if (options.modal) {
      return showMessageBox(extId, key, options)
    }
    return showNotifyBox(extId, key, options)
  },
  async showInputBox(key, extId, options, validateInput) {
    return showInputBox(extId, key, {
      ...options,
      validateInput,
    })
      .then((result) => {
        console.log('result', result)
        return result
      })
      .catch((err) => {
        console.log('err', err)
        throw err
      })
  },
  async showOpenBox(key, extId, options) {
    // TODO import.meta.env.VITE_IS_WEB
  },
  async showSaveBox(key, extId, options) {
    // TODO import.meta.env.VITE_IS_WEB
  },
  async closeMessageBox(key) {
    closeMessageBoxEvent.emit(key)
  },
  async updateInfo(info) {
    updateInfoEvent.emit(info)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
