import { appState } from '@/app/app'
import { checkAllowPath } from '@/app/modules/fileSystem'
import { getLyricInfo, getMusicPic, getMusicUrl } from '@/app/modules/music'
import { workers } from '@/app/worker'

import type { ExposeClientFunctions } from '.'

// 暴露给前端的方法
export const createExposeMusic = () => {
  return {
    async getMusicUrl(event, info) {
      return getMusicUrl(info)
    },
    async getMusicUrlCount(event) {
      return workers.dbService.musicUrlCount()
    },
    async clearMusicUrl(event) {
      return workers.dbService.musicUrlClear()
    },

    async getMusicPic(event, info) {
      return getMusicPic(info)
    },

    async getMusicLyric(event, info) {
      return getLyricInfo(info)
    },
    async setMusicLyric(event, id, info) {
      return workers.dbService.editedLyricSave(id, info)
    },
    async removeMusicLyric(event, id) {
      return workers.dbService.editedLyricRemove([id])
    },
    async getMusicLyricCount(event) {
      return workers.dbService.rawLyricCount()
    },
    async clearMusicLyric(event) {
      return workers.dbService.rawLyricClear()
    },
    async createLocalMusicInfos(event, paths) {
      // 客户端路径来自受控的文件浏览，这里再过滤一次，避免直接传任意路径探测文件
      return workers.utilService.createLocalMusicInfos(
        paths.filter((p) => import.meta.env.DEV || checkAllowPath(p)),
        appState.machineId,
        true
      )
    },
  } satisfies Partial<ExposeClientFunctions>
}
