import type { ExposeFunctions, MainCall } from '.'
import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'

// 暴露给后端的方法
export const createExposeList = () => {
  return {
    async listAction(event, action) {
      ipcPreloadEvent.listAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientList = (main: MainCall) => {
  return {
    async getAllUserLists() {
      return main.getAllUserLists()
    },
    async getListMusics(id) {
      return main.getListMusics(id)
    },
    async getMusicExistListIds(listId) {
      return main.getMusicExistListIds(listId)
    },
    async checkListExistMusic(listId, musicId) {
      return main.checkListExistMusic(listId, musicId)
    },
    async listAction(action) {
      return main.listAction(action)
    },
    onListAction(listener) {
      ipcPreloadEvent.on('listAction', listener)
      return () => {
        ipcPreloadEvent.off('listAction', listener)
      }
    },
    async getListScrollPosition() {
      return main.getListScrollPosition()
    },
    async saveListScrollPosition(id, position) {
      return main.saveListScrollPosition(id, position)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
