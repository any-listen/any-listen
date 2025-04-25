import type { DBSeriveTypes } from '../worker/utils'
import { dislikeListEvent, initDislikeListEvent } from './event'

let dbService: DBSeriveTypes

export const initDislikeList = (_dbService: DBSeriveTypes) => {
  dbService = _dbService
  initDislikeListEvent(_dbService)
}

export const getDislikeListInfo = async () => {
  return dbService.getDislikeListInfo()
}

export const sendDislikeAction = async (action: AnyListen.IPCDislikeList.ActionList) => {
  switch (action.action) {
    case 'dislike_data_overwrite':
      await dislikeListEvent.dislike_data_overwrite(action.data)
      break
    case 'dislike_music_add':
      await dislikeListEvent.dislike_music_add(action.data)
      break
    case 'dislike_music_clear':
      await dislikeListEvent.dislike_music_clear()
      break
  }
}

export const onDislikeAction = (
  dislikeAction: (action: AnyListen.IPCDislikeList.ActionList) => void | Promise<void>
): (() => void) => {
  const dislike_music_add = async (listData: AnyListen.Dislike.DislikeMusicInfo[]) => {
    return dislikeAction({
      action: 'dislike_music_add',
      data: listData,
    })
  }
  const dislike_data_overwrite = async (rules: AnyListen.Dislike.DislikeRules) => {
    return dislikeAction({
      action: 'dislike_data_overwrite',
      data: rules,
    })
  }
  const dislike_music_clear = async () => {
    return dislikeAction({
      action: 'dislike_music_clear',
    })
  }
  dislikeListEvent.on('dislike_music_add', dislike_music_add)
  dislikeListEvent.on('dislike_data_overwrite', dislike_data_overwrite)
  dislikeListEvent.on('dislike_music_clear', dislike_music_clear)
  return () => {
    dislikeListEvent.off('dislike_music_add', dislike_music_add)
    dislikeListEvent.off('dislike_data_overwrite', dislike_data_overwrite)
    dislikeListEvent.off('dislike_music_clear', dislike_music_clear)
  }
}

export { dislikeListEvent }
