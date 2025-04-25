import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'
import type { ExposeFunctions, MainCall } from '.'

// 暴露给后端的方法
export const createExposePlayer = () => {
  return {
    async playerAction(event, action) {
      ipcPreloadEvent.playerAction(action)
    },
    async playListAction(event, action) {
      ipcPreloadEvent.playListAction(action)
    },
    async playHistoryListAction(event, action) {
      ipcPreloadEvent.playHistoryListAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientPlayer = (main: MainCall) => {
  return {
    async getPlayInfo() {
      return main.getPlayInfo()
    },
    async playerEvent(event) {
      return main.playerEvent(event)
    },
    async playListAction(action) {
      return main.playListAction(action)
    },
    async playHistoryListAction(action) {
      return main.playHistoryListAction(action)
    },
    onPlayerAction(listener) {
      ipcPreloadEvent.on('playerAction', listener)
      return () => {
        ipcPreloadEvent.off('playerAction', listener)
      }
    },
    onPlayListAction(listener) {
      ipcPreloadEvent.on('playListAction', listener)
      return () => {
        ipcPreloadEvent.off('playListAction', listener)
      }
    },
    onPlayHistoryListAction(listener) {
      ipcPreloadEvent.on('playHistoryListAction', listener)
      return () => {
        ipcPreloadEvent.off('playHistoryListAction', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
