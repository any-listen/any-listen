import type { IPCSocket } from '@/preload/ws'

import type { ClientCall, ExposeFunctions } from '.'

// 暴露给后端的方法
export const createExposePlayer = (client: ClientCall) => {
  return {
    async playerAction(event, action) {
      return client.playerAction(action)
    },
    async playListAction(event, action) {
      return client.playListAction(action)
    },
    async playHistoryListAction(event, action) {
      return client.playHistoryListAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientPlayer = (ipcSocket: IPCSocket) => {
  return {
    async getPlayInfo() {
      return ipcSocket.remoteQueuePlayer.getPlayInfo()
    },
    async playerEvent(event) {
      return ipcSocket.remoteQueuePlayer.playerEvent(event)
    },
    async playListAction(action) {
      return ipcSocket.remoteQueuePlayer.playListAction(action)
    },
    async playHistoryListAction(action) {
      return ipcSocket.remoteQueuePlayer.playHistoryListAction(action)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
