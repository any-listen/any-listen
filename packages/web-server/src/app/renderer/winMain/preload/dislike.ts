import type { IPCSocket } from '@/preload/ws'

import type { ClientCall, ExposeFunctions } from '.'

// 暴露给后端的方法
export const createExposeDislike = (client: ClientCall) => {
  return {
    async dislikeAction(socket: IPCSocket, action: AnyListen.IPCDislikeList.ActionList) {
      return client.dislikeAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientDislike = (ipcSocket: IPCSocket) => {
  return {
    async getDislikeInfo() {
      return ipcSocket.remoteQueueDislike.getDislikeInfo()
    },
    async dislikeAction(action) {
      return ipcSocket.remoteQueueDislike.dislikeAction(action)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
