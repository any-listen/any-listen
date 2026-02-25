import { getDislikeListInfo, sendDislikeAction } from '@any-listen/app/modules/dislikeList'

import type { ExposeFunctions } from '.'

// 暴露给前端的方法
export const createExposeDislike = () => {
  return {
    async getDislikeInfo() {
      return getDislikeListInfo()
    },
    async dislikeAction(event, action) {
      return sendDislikeAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}
