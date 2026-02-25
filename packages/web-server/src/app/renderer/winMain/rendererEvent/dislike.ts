import { getDislikeListInfo, onDislikeAction, sendDislikeAction } from '@any-listen/app/modules/dislikeList'

import { broadcast } from '@/modules/ipc/websocket'

import type { ExposeServerFunctions, ExposeClientFunctions } from '.'

// 暴露给前端的方法
export const createExposeDislike = () => {
  return {
    async getDislikeInfo() {
      return getDislikeListInfo()
    },
    async dislikeAction(event, action) {
      return sendDislikeAction(action)
    },
  } satisfies Partial<ExposeClientFunctions>
}

// 暴露给后端的方法
export const createServerDislike = () => {
  const actions = {
    async dislikeAction(action) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remoteQueueDislike.dislikeAction(action)
      })
    },
  } satisfies Partial<ExposeServerFunctions>

  // eslint-disable-next-line @typescript-eslint/unbound-method
  onDislikeAction(actions.dislikeAction)

  return actions
}
