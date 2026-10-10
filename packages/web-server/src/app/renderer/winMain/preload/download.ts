import type { IPCSocket } from '@/preload/ws'

import type { ClientCall, ExposeFunctions } from '.'

export const createExposeDownload = (client: ClientCall) => {
  return {
    async downloadListAction(event, items) {
      return client.downloadListAction(items)
    },
  } satisfies Partial<ExposeFunctions>
}

export const createClientDownload = (ipcSocket: IPCSocket) => {
  return {
    async downloadMusic(musicInfos, options) {
      return ipcSocket.remote.downloadMusic(musicInfos, options)
    },
    async getDownloadSnapshot() {
      return ipcSocket.remote.getDownloadSnapshot()
    },
    async startDownloadTasks(ids) {
      return ipcSocket.remote.startDownloadTasks(ids)
    },
    async pauseDownloadTasks(ids) {
      return ipcSocket.remote.pauseDownloadTasks(ids)
    },
    async removeDownloadTasks(ids) {
      return ipcSocket.remote.removeDownloadTasks(ids)
    },
    async getDownloadMusicInfos(ids) {
      return ipcSocket.remote.getDownloadMusicInfos(ids)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
