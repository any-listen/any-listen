import { ipc } from './ipc'

// TODO: check last start info
export const getLastStartInfo: AnyListen.IPC.ServerIPC['getLastStartInfo'] = async () => {
  return ipc.getLastStartInfo()
}
export const saveLastStartInfo: AnyListen.IPC.ServerIPC['saveLastStartInfo'] = async () => {
  await ipc.saveLastStartInfo()
}

export const getSearchHistoryList: AnyListen.IPC.ServerIPC['getSearchHistoryList'] = async () => {
  return ipc.getSearchHistoryList()
}
export const saveSearchHistoryList: AnyListen.IPC.ServerIPC['saveSearchHistoryList'] = async (list) => {
  return ipc.saveSearchHistoryList(list)
}

export const saveIgnoreVersion: AnyListen.IPC.ServerIPC['saveIgnoreVersion'] = async (version) => {
  return ipc.saveIgnoreVersion(version)
}
