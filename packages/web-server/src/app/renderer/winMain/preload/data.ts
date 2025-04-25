import type { IPCSocket } from '@/preload/ws'

// 暴露给前端的方法
export const createClientData = (ipcSocket: IPCSocket) => {
  return {
    async getLastStartInfo() {
      return ipcSocket.remote.getLastStartInfo()
    },
    async saveLastStartInfo() {
      return ipcSocket.remote.saveLastStartInfo()
    },
    async getPlayInfo() {
      return ipcSocket.remoteQueuePlayer.getPlayInfo()
    },

    async getListPrevSelectId() {
      return ipcSocket.remote.getListPrevSelectId()
    },
    async saveListPrevSelectId(id) {
      return ipcSocket.remote.saveListPrevSelectId(id)
    },

    async getSearchHistoryList() {
      return ipcSocket.remote.getSearchHistoryList()
    },
    async saveSearchHistoryList(list) {
      return ipcSocket.remote.saveSearchHistoryList(list)
    },

    async saveIgnoreVersion(ver) {
      return ipcSocket.remote.saveIgnoreVersion(ver)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
