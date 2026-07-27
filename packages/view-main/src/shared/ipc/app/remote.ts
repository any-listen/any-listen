import { showMessageBox } from '@/components/apis/dialog/messageBox'
import { showInputBox } from '@/components/apis/inputModal/inputBox'
import { showNotifyBox } from '@/components/apis/notify'
import { setFullScreen } from '@/modules/app/store/action'
import { extI18n } from '@/modules/extension/i18n'
import { extensionState } from '@/modules/extension/store/state'

import { showOpenDialog, showSaveDialog } from '.'
import { showFileSaveModal, showFileSelectModal } from '../fs/fileSelectModal'
import { appLogEvent, closeMessageBoxEvent, deeplinkEvent, settingChangedEvent, updateInfoEvent, winShowEvent } from './event'

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
  async fullscreen(isFullscreen) {
    setFullScreen(isFullscreen, true)
  },
  async showMessageBox(key, extId, options) {
    if (options.modal) {
      return showMessageBox(extId, key, options)
    }
    return showNotifyBox(extId, key, options)
  },
  async showInputBox(key, extId, options, validateInput) {
    return showInputBox(
      {
        ...options,
        validateInput,
      },
      key,
      extId
    )
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
      ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        Object.entries(options.filters || {}).map(([name, extensions]) => ({
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
    let result: AnyListen.SaveDialogResult = { canceled: true, filePath: '' }
    if (import.meta.env.VITE_IS_WEB) {
      result = await showFileSaveModal({
        modalTitle: extName,
        title: options.title,
        buttonLabel: options.saveLabel,
        defaultFileName: options.defaultFileName,
      })
    }
    if (import.meta.env.VITE_IS_DESKTOP) {
      result = await showSaveDialog({
        title: `${options.title} (${extName})`,
        defaultFileName: options.defaultFileName,
        buttonLabel: options.saveLabel,
      })
    }
    return result.canceled || !result.filePath ? '' : result.filePath
  },
  async closeMessageBox(key) {
    closeMessageBoxEvent.emit(key)
  },
  async updateInfo(info) {
    updateInfoEvent.emit(info)
  },
  async appLog(type, log) {
    appLogEvent.emit(type, log)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
