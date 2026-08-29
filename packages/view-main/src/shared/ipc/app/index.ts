import { showFileSaveModal, showFileSelectModal } from '../fs/fileSelectModal'
import { ipc } from '../ipc'

export const getAppInfo: AnyListen.IPC.ServerIPC['getAppInfo'] = async () => {
  return ipc.getAppInfo()
}

export const getSetting: AnyListen.IPC.ServerIPC['getSetting'] = async () => {
  return ipc.getSetting()
}
export const setSetting: AnyListen.IPC.ServerIPC['setSetting'] = async (setting) => {
  await ipc.setSetting(setting)
}

export const sendInitedEvent = async () => {
  return ipc.inited()
}

export const setSystemThemeMode = async (isDark: boolean) => {
  return ipc.setSystemThemeMode(isDark)
}

export const minWindow = async () => {
  return ipc.minWindow()
}
export const closeWindow = async () => {
  return ipc.closeWindow(false)
}
export const closeWindowForce = async () => {
  return ipc.closeWindow(true)
}
export const exitApp = async () => {
  return ipc.exitApp()
}
export const fullscreenWindow = async (isFull: boolean) => {
  return ipc.fullscreenWindow(isFull)
}
export const showOpenDialog: AnyListen.IPC.ServerIPC['showOpenDialog'] = async (opts) => {
  if (import.meta.env.VITE_IS_WEB) {
    return showFileSelectModal(opts)
  }
  return ipc.showOpenDialog(opts)
}
export const showSaveDialog: AnyListen.IPC.ServerIPC['showSaveDialog'] = async (opts) => {
  if (import.meta.env.VITE_IS_WEB) {
    return showFileSaveModal(opts)
  }
  if (opts.defaultFileName) opts.defaultPath = opts.defaultFileName
  return ipc.showSaveDialog(opts)
}
export const openDirInExplorer: AnyListen.IPC.ServerIPC['openDirInExplorer'] = async (path) => {
  return ipc.openDirInExplorer(path)
}

export const clipboardReadText = async () => {
  return ipc.clipboardReadText()
}
export const clipboardWriteText = async (text: string) => {
  await ipc.clipboardWriteText(text)
}

export const getLoginDevices: AnyListen.IPC.ServerIPC['getLoginDevices'] = async () => {
  return ipc.getLoginDevices()
}
export const removeLoginDevice: AnyListen.IPC.ServerIPC['removeLoginDevice'] = async (id) => {
  return ipc.removeLoginDevice(id)
}
export const openDevTools: AnyListen.IPC.ServerIPC['openDevTools'] = async () => {
  return ipc.openDevTools()
}
export const openUrl: AnyListen.IPC.ServerIPC['openUrl'] = async (url) => {
  return ipc.openUrl(url)
}

export const getCurrentVersionInfo: AnyListen.IPC.ServerIPC['getCurrentVersionInfo'] = async () => {
  return ipc.getCurrentVersionInfo()
}
export const checkUpdate: AnyListen.IPC.ServerIPC['checkUpdate'] = async () => {
  return ipc.checkUpdate()
}
export const downloadUpdate: AnyListen.IPC.ServerIPC['downloadUpdate'] = async () => {
  return ipc.downloadUpdate()
}
export const restartUpdate: AnyListen.IPC.ServerIPC['restartUpdate'] = async () => {
  return ipc.restartUpdate()
}

const INTERNAL_FONT = '"Inter Variable"'
export const getSystemFonts: AnyListen.IPC.ServerIPC['getSystemFonts'] = async () => {
  return ipc.getSystemFonts().then((fonts) => {
    return fonts.includes(INTERNAL_FONT) ? fonts : [INTERNAL_FONT, ...fonts]
  })
}

export const getCacheSize: AnyListen.IPC.ServerIPC['getCacheSize'] = async () => {
  return ipc.getCacheSize()
}
export const clearCache: AnyListen.IPC.ServerIPC['clearCache'] = async () => {
  return ipc.clearCache()
}

export const exportData: AnyListen.IPC.ServerIPC['exportData'] = async (path, types) => {
  return ipc.exportData(path, types)
}
export const importData: AnyListen.IPC.ServerIPC['importData'] = async (path, selectData, getListMergeMode) => {
  return ipc.importData(path, selectData, getListMergeMode)
}
export const setBackupPath: AnyListen.IPC.ServerIPC['setBackupPath'] = async (path) => {
  return ipc.setBackupPath(path)
}

export const getAppLogs: AnyListen.IPC.ServerIPC['getAppLogs'] = async (type) => {
  return ipc.getAppLogs(type)
}
export const clearAppLog: AnyListen.IPC.ServerIPC['clearAppLog'] = async (type) => {
  return ipc.clearAppLog(type)
}
