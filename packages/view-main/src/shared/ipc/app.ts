import { showFileSelectModal } from './fs/fileSelectModal'
import { ipc } from './ipc'

export const getSetting: AnyListen.IPC.ServerIPC['getSetting'] = async () => {
  return ipc.getSetting()
}
export const setSetting: AnyListen.IPC.ServerIPC['setSetting'] = async (setting) => {
  await ipc.setSetting(setting)
}
export const onSettingChanged: AnyListen.IPC.ServerIPC['onSettingChanged'] = (listener) => {
  return ipc.onSettingChanged(listener)
}

export const sendInitedEvent = async () => {
  return ipc.inited()
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
export const showOpenDialog: AnyListen.IPC.ServerIPC['showOpenDialog'] = async (opts) => {
  if (import.meta.env.VITE_IS_WEB) {
    return showFileSelectModal(opts)
  }
  return ipc.showOpenDialog(opts)
}
export const showSaveDialog: AnyListen.IPC.ServerIPC['showSaveDialog'] = async (opts) => {
  return ipc.showSaveDialog(opts)
}
export const openDirInExplorer: AnyListen.IPC.ServerIPC['openDirInExplorer'] = async (path) => {
  return ipc.openDirInExplorer(path)
}
export const onCreateDesktopLyricProcess: AnyListen.IPC.ServerIPC['onCreateDesktopLyricProcess'] = (listener) => {
  return ipc.onCreateDesktopLyricProcess(listener)
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

export const onShowMessageBox: AnyListen.IPC.ServerIPC['onShowMessageBox'] = (listener) => {
  return ipc.onShowMessageBox(listener)
}
export const onCloseMessageBox: AnyListen.IPC.ServerIPC['onCloseMessageBox'] = (listener) => {
  return ipc.onCloseMessageBox(listener)
}
export const onShowInputBox: AnyListen.IPC.ServerIPC['onShowInputBox'] = (listener) => {
  return ipc.onShowInputBox(listener)
}
export const onShowOpenBox: AnyListen.IPC.ServerIPC['onShowOpenBox'] = (listener) => {
  return ipc.onShowOpenBox(listener)
}
export const onShowSaveBox: AnyListen.IPC.ServerIPC['onShowSaveBox'] = (listener) => {
  return ipc.onShowSaveBox(listener)
}
export const messageBoxConfirm: AnyListen.IPC.ServerIPC['messageBoxConfirm'] = async (key, result) => {
  return ipc.messageBoxConfirm(key, result)
}

export const getCurrentVersionInfo: AnyListen.IPC.ServerIPC['getCurrentVersionInfo'] = async () => {
  return ipc.getCurrentVersionInfo()
}
export const onUpdateInfo: AnyListen.IPC.ServerIPC['onUpdateInfo'] = (listener) => {
  return ipc.onUpdateInfo(listener)
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
