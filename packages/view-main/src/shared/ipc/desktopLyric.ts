import { ipc } from './ipc'

export const showDesktopLyric: AnyListen.IPC.ServerIPC['showDesktopLyric'] = async () => {
  return ipc.showDesktopLyric()
}
export const hideDesktopLyric: AnyListen.IPC.ServerIPC['hideDesktopLyric'] = async () => {
  await ipc.hideDesktopLyric()
}
