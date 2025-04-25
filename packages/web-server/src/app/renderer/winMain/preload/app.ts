import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'
import type { IPCSocket } from '@/preload/ws'
import type { ExposeFunctions } from '.'

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
    async settingChanged(socket, keys, setting) {
      ipcPreloadEvent.settingChanged(keys, setting)
    },
    async deeplink(event, deeplink) {
      ipcPreloadEvent.deeplinkAction(deeplink)
    },
    async createDesktopLyricProcess(event) {
      // TODO
      // ipcPreloadEvent.createDesktopLyricProcess(event.ports)
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
export const createClientApp = (ipcSocket: IPCSocket) => {
  return {
    async getSetting() {
      return ipcSocket.remote.getSetting()
    },
    async setSetting(setting) {
      return ipcSocket.remote.setSetting(setting)
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
      return ipcSocket.remote.inited()
    },
    async minWindow() {
      // return ipcSocket.remote.minWindow()
    },
    async closeWindow(isForce) {
      await ipcSocket.logout()
      if (isForce) window.close()
      // return ipcSocket.remote.closeWindow(isForce)
    },
    onCreateDesktopLyricProcess(listener) {
      // TODO
      // ipcPreloadEvent.on('createDesktopLyricProcess', listener)
      return () => {
        // ipcPreloadEvent.off('createDesktopLyricProcess', listener)
      }
    },

    // async showOpenDialog(opts) {
    //   // return main.showOpenDialog(opts)
    // },
    // async showSaveDialog(opts) {
    //   // return main.showSaveDialog(opts)
    // },
    async openDirInExplorer(path) {
      // return main.openDirInExplorer(path)
    },

    async clipboardReadText() {
      return navigator.clipboard.readText()
    },
    async clipboardWriteText(text) {
      await navigator.clipboard.writeText(text)
    },

    async fileSystemAction(action) {
      return ipcSocket.remote.fileSystemAction(action)
    },

    async getLoginDevices() {
      return ipcSocket.remote.getLoginDevices()
    },
    async removeLoginDevice(id) {
      return ipcSocket.remote.removeLoginDevice(id)
    },
    async openUrl(url) {
      window.open(url)
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
      return ipcSocket.remote.getCurrentVersionInfo()
    },
    async checkUpdate() {
      return ipcSocket.remote.checkUpdate()
    },
    async downloadUpdate() {
      return ipcSocket.remote.downloadUpdate()
    },
    async restartUpdate() {
      return ipcSocket.remote.restartUpdate()
    },
    onUpdateInfo(listener) {
      ipcPreloadEvent.on('updateInfo', listener)
      return () => {
        ipcPreloadEvent.off('updateInfo', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
