import type { HOTKEY_Type } from '@any-listen/common/hotKey'

import { ipc } from '../ipc'

export const getHotKey = async (): Promise<AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>> => {
  return (await ipc.getHotKey()) as AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>
}

export const getHotkeyStatus: AnyListen.IPC.ServerIPC['getHotkeyStatus'] = async () => {
  return ipc.getHotkeyStatus()
}
export const hotkeyConfigAction: AnyListen.IPC.ServerIPC['hotkeyConfigAction'] = async (action) => {
  return ipc.hotkeyConfigAction(action)
}
