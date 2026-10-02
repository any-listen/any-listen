import {
  downloadMusic,
  getDownloadSnapshot,
  startDownloadTasks,
  pauseDownloadTasks,
  removeDownloadTasks,
  getDownloadMusicInfos,
  onDownloadListAction,
} from '@any-listen/app/modules/download'

import { broadcast } from '@/modules/ipc/websocket'
import { appLog } from '@/shared/log4js'

import type { ExposeClientFunctions, ExposeServerFunctions } from '.'

export const createExposeDownload = () => {
  return {
    async downloadMusic(event, musicInfos, options) {
      return downloadMusic(musicInfos, options)
    },
    async getDownloadSnapshot() {
      return getDownloadSnapshot()
    },
    async startDownloadTasks(event, ids) {
      return startDownloadTasks(ids)
    },
    async pauseDownloadTasks(event, ids) {
      return pauseDownloadTasks(ids)
    },
    async removeDownloadTasks(event, ids) {
      return removeDownloadTasks(ids)
    },
    async getDownloadMusicInfos(event, ids) {
      return getDownloadMusicInfos(ids)
    },
  } satisfies Partial<ExposeClientFunctions>
}

export const createServerDownload = () => {
  const actions = {
    async downloadListAction(items) {
      broadcast((socket) => {
        if (socket.winType !== 'main' || !socket.isInited) return
        void socket.remote.downloadListAction(items).catch((err: unknown) => {
          appLog.error('Download event error', err)
        })
      })
    },
  } satisfies Partial<ExposeServerFunctions>
  onDownloadListAction((items) => actions.downloadListAction(items))
  return actions
}
