import type { ExposeFunctions } from '.'
import {
  checkListExistMusic,
  getAllUserLists,
  getListMusics,
  getListScrollInfo,
  getMusicExistListIds,
  saveListScrollPosition,
  sendMusicListAction,
} from '@any-listen/app/modules/musicList'

// 暴露给前端的方法
export const createExposeList = () => {
  return {
    async getAllUserLists(event) {
      return getAllUserLists()
    },
    async getListMusics(event, listId) {
      return getListMusics(listId)
    },
    async getMusicExistListIds(event, musicId) {
      return getMusicExistListIds(musicId)
    },
    async checkListExistMusic(event, listId, musicId) {
      return checkListExistMusic(listId, musicId)
    },
    async listAction(event, action) {
      return sendMusicListAction(action)
    },
    async getListScrollPosition(event) {
      return getListScrollInfo()
    },
    async saveListScrollPosition(event, id, position) {
      return saveListScrollPosition(id, position)
    },
  } satisfies Partial<ExposeFunctions>
}
