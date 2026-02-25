import { sendAction } from '@/shared/ipc/dislike'
import { dislikeActionEvent } from '@/shared/ipc/dislike/event'

import * as commit from './commit'

export { getInfo } from '@/shared/ipc/dislike'

export const overwirteInfo = async (data: string) => {
  await sendAction({ action: 'dislike_data_overwrite', data })
}

export const addInfo = async (data: AnyListen.Dislike.DislikeMusicInfo[]) => {
  await sendAction({ action: 'dislike_music_add', data })
}

export const clearInfo = async () => {
  await sendAction({ action: 'dislike_music_clear' })
}

export const registerRemoteActions = () => {
  return dislikeActionEvent.on((action): void => {
    switch (action.action) {
      case 'dislike_data_overwrite':
        commit.overwirteDislikeInfo(action.data)
        break
      case 'dislike_music_add':
        commit.addDislikeInfo(action.data)
        break
      case 'dislike_music_clear':
        commit.clearDislikeInfo()
        break
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default:
        console.warn('unknown action:', action)
        // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
        let unknownAction: never = action
    }
  })
}
