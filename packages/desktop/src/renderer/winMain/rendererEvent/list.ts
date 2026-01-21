import {
  addFolderMusics,
  cancelAddFolderMusics,
  checkListExistMusic,
  getAllUserLists,
  getListMusics,
  getListScrollInfo,
  getMusicExistListIds,
  saveListScrollPosition,
  sendMusicListAction,
  sortListMusics,
  syncUserList,
} from '@any-listen/app/modules/musicList'
import type { ExposeFunctions } from '.'

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

    async addFolderMusics(event, listId, filePaths, onEnd) {
      return addFolderMusics(listId, filePaths, onEnd)
    },
    async cancelAddFolderMusics(event, taskId) {
      return cancelAddFolderMusics(taskId)
    },
    async syncUserList(event, id) {
      return syncUserList(id)
    },
    async sortListMusics(event, id, list, type) {
      return sortListMusics(id, list, type)
    },
  } satisfies Partial<ExposeFunctions>
}
