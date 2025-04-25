import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'
import type { ExposeFunctions, MainCall } from '.'

// 暴露给后端的方法
export const createExposeDislike = () => {
  return {
    async dislikeAction(event, action) {
      ipcPreloadEvent.dislikeAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientDislike = (main: MainCall) => {
  return {
    async getDislikeInfo() {
      return main.getDislikeInfo()
    },
    async dislikeAction(action) {
      return main.dislikeAction(action)
    },
    onDislikeAction(listener: (action: AnyListen.IPCDislikeList.ActionList) => void) {
      ipcPreloadEvent.on('dislikeAction', listener)
      return () => {
        ipcPreloadEvent.off('dislikeAction', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
