import type { ClientCall, ExposeFunctions, MainCall } from '.'

export const createExposeDownload = (client: ClientCall) => {
  return {
    async downloadListAction(event, items) {
      return client.downloadListAction(items)
    },
  } satisfies Partial<ExposeFunctions>
}

export const createClientDownload = (main: MainCall) => {
  return {
    async downloadMusic(musicInfos, options) {
      return main.downloadMusic(musicInfos, options)
    },
    async getDownloadSnapshot() {
      return main.getDownloadSnapshot()
    },
    async startDownloadTasks(ids) {
      return main.startDownloadTasks(ids)
    },
    async pauseDownloadTasks(ids) {
      return main.pauseDownloadTasks(ids)
    },
    async removeDownloadTasks(ids) {
      return main.removeDownloadTasks(ids)
    },
    async getDownloadMusicInfos(ids) {
      return main.getDownloadMusicInfos(ids)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
