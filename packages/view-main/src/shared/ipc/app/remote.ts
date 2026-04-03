import { showMessageBox } from '@/components/apis/dialog/messageBox'
import { showInputBox } from '@/components/apis/inputModal/inputBox'
import { showNotifyBox } from '@/components/apis/notify'
import { extI18n } from '@/modules/extension/i18n'
import { extensionState } from '@/modules/extension/store/state'

import { showOpenDialog } from '.'
import { showFileSelectModal } from '../fs/fileSelectModal'
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
    let ext = extensionState.extensionList.find((ext) => ext.id === extId)
    const extName = ext ? extI18n.t(extId, ext.name) : ''
    // TODO import.meta.env.VITE_IS_WEB
    const properties: NonNullable<AnyListen.OpenDialogOptions['properties']> = []
    if (options.canSelectFiles) properties.push('openFile')
    if (options.canSelectFolders) properties.push('openDirectory')
    if (options.canSelectMany) properties.push('multiSelections')
    const filters: AnyListen.OpenDialogOptions['filters'] = options.filters
      ? Object.entries(options.filters || {}).map(([name, extensions]) => ({
          name,
          extensions,
        }))
      : undefined
    let result: AnyListen.OpenDialogResult = { canceled: true, filePaths: [] }
    if (import.meta.env.VITE_IS_WEB) {
      result = await showFileSelectModal({
        modalTitle: extName,
        title: options.title,
        filters,
        properties,
        buttonLabel: options.openLabel,
      })
    }
    if (import.meta.env.VITE_IS_DESKTOP) {
      result = await showOpenDialog({
        title: `${options.title} (${extName})`,
        filters,
        properties,
      })
    }

    return result.canceled ? [] : result.filePaths
  },
  async showSaveBox(key, extId, options) {
    let ext = extensionState.extensionList.find((ext) => ext.id === extId)
    const extName = ext ? extI18n.t(extId, ext.name) : ''
    let result: AnyListen.OpenDialogResult = { canceled: true, filePaths: [] }
    if (import.meta.env.VITE_IS_WEB) {
      result = await showFileSelectModal({
        modalTitle: extName,
        title: options.title,
        properties: ['openDirectory'],
        buttonLabel: options.saveLabel,
      })
    }
    if (import.meta.env.VITE_IS_DESKTOP) {
      result = await showOpenDialog({
        title: `${options.title} (${extName})`,
        properties: ['openDirectory'],
        buttonLabel: options.saveLabel,
      })
    }
    return result.canceled || result.filePaths.length === 0 ? '' : result.filePaths[0]
  },
  async closeMessageBox(key) {
    closeMessageBoxEvent.emit(key)
  },
  async updateInfo(info) {
    updateInfoEvent.emit(info)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
