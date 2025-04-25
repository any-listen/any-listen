import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'
import type { ExposeFunctions, MainCall } from '.'

const handleShowBox = async <T>(key: string) => {
  return new Promise<T>((resolve, reject) => {
    let release = () => {
      // if (timeout) {
      //   clearTimeout(timeout)
      //   timeout = null
      // }
      ipcPreloadEvent.off('messageBoxConfirm', handleConfirm)
      ipcPreloadEvent.off('closeMessageBox', handleClose)
    }
    // let timeout: number | null = setTimeout(
    //   () => {
    //     timeout = null
    //     ipcPreloadEvent.closeMessageBox(key, 'timeout')
    //   },
    //   60 * 1000 * 60
    // )
    const handleConfirm = (_key: string, result: T) => {
      if (_key != key) return
      release()
      resolve(result)
    }
    const handleClose = (_key: string, message?: string) => {
      if (_key != key) return
      release()
      reject(new Error(message ?? 'canceled'))
    }
    ipcPreloadEvent.on('messageBoxConfirm', handleConfirm)
    ipcPreloadEvent.on('closeMessageBox', handleClose)
  })
}

// 暴露给后端的方法
export const createExposeApp = () => {
  return {
    async settingChanged(event, keys, setting) {
      ipcPreloadEvent.settingChanged(keys, setting)
    },
    async deeplink(event, deeplink) {
      ipcPreloadEvent.deeplinkAction(deeplink)
    },
    async createDesktopLyricProcess(event) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ipcPreloadEvent.createDesktopLyricProcess(event.ports)
    },

    async showMessageBox(event, extId, key, options) {
      ipcPreloadEvent.showMessageBox(extId, key, options)
      return handleShowBox<number>(key)
    },
    async showInputBox(event, extId, key, options) {
      ipcPreloadEvent.showInputBox(extId, key, options)
      return handleShowBox<string | undefined>(key)
    },
    async showOpenBox(event, extId, key, options) {
      ipcPreloadEvent.showOpenBox(extId, key, options)
      return handleShowBox<string | string[] | undefined>(key)
    },
    async showSaveBox(event, extId, key, options) {
      ipcPreloadEvent.showSaveBox(extId, key, options)
      return handleShowBox<string | undefined>(key)
    },
    async closeMessageBox(event, key) {
      ipcPreloadEvent.closeMessageBox(key)
    },
    async updateInfo(event, info) {
      ipcPreloadEvent.updateInfo(info)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientApp = (main: MainCall) => {
  return {
    async getSetting() {
      return main.getSetting()
    },
    async setSetting(setting) {
      return main.setSetting(setting)
    },
    onSettingChanged(listener) {
      ipcPreloadEvent.on('settingChanged', listener)
      return () => {
        ipcPreloadEvent.off('settingChanged', listener)
      }
    },
    onDeeplink(listener) {
      ipcPreloadEvent.on('deeplinkAction', listener)
      return () => {
        ipcPreloadEvent.off('deeplinkAction', listener)
      }
    },
    async inited() {
      return main.inited()
    },
    async minWindow() {
      return main.minWindow()
    },
    async closeWindow(isForce) {
      return main.closeWindow(isForce)
    },
    onCreateDesktopLyricProcess(listener) {
      ipcPreloadEvent.on('createDesktopLyricProcess', listener)
      return () => {
        ipcPreloadEvent.off('createDesktopLyricProcess', listener)
      }
    },

    async showOpenDialog(opts) {
      return main.showOpenDialog(opts)
    },
    async showSaveDialog(opts) {
      return main.showSaveDialog(opts)
    },
    async openDirInExplorer(path) {
      return main.openDirInExplorer(path)
    },
    async clipboardReadText() {
      return main.clipboardReadText()
    },
    async clipboardWriteText(text) {
      return main.clipboardWriteText(text)
    },
    async openDevTools() {
      return main.openDevTools()
    },
    async openUrl(url) {
      return main.openUrl(url)
    },

    async messageBoxConfirm(key, result) {
      ipcPreloadEvent.messageBoxConfirm(key, result)
    },
    onShowMessageBox(listener) {
      ipcPreloadEvent.on('showMessageBox', listener)
      return () => {
        ipcPreloadEvent.off('showMessageBox', listener)
      }
    },
    onShowInputBox(listener) {
      ipcPreloadEvent.on('showInputBox', listener)
      return () => {
        ipcPreloadEvent.off('showInputBox', listener)
      }
    },
    onShowOpenBox(listener) {
      ipcPreloadEvent.on('showOpenBox', listener)
      return () => {
        ipcPreloadEvent.off('showOpenBox', listener)
      }
    },
    onShowSaveBox(listener) {
      ipcPreloadEvent.on('showSaveBox', listener)
      return () => {
        ipcPreloadEvent.off('showSaveBox', listener)
      }
    },
    onCloseMessageBox(listener) {
      ipcPreloadEvent.on('closeMessageBox', listener)
      return () => {
        ipcPreloadEvent.off('closeMessageBox', listener)
      }
    },
    async getCurrentVersionInfo() {
      return main.getCurrentVersionInfo()
    },
    async checkUpdate() {
      return main.checkUpdate()
    },
    async downloadUpdate() {
      return main.downloadUpdate()
    },
    async restartUpdate() {
      return main.restartUpdate()
    },
    onUpdateInfo(listener) {
      ipcPreloadEvent.on('updateInfo', listener)
      return () => {
        ipcPreloadEvent.off('updateInfo', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
