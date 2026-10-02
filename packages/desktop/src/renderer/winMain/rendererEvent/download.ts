import {
  downloadMusic,
  getDownloadSnapshot,
  startDownloadTasks,
  pauseDownloadTasks,
  removeDownloadTasks,
  getDownloadMusicInfos,
} from '@any-listen/app/modules/download'

import type { ExposeFunctions } from '.'

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
  } satisfies Partial<ExposeFunctions>
}
