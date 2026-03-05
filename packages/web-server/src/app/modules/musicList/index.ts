import {
  initMusicList as _initMusicList,
  getListsCover as _getListsCover,
  musicListEvent,
  clearListCoverCache,
} from '@any-listen/app/modules/musicList'
import { STORE_NAMES } from '@any-listen/common/constants'

import getStore from '@/app/shared/store'
import { workers } from '@/app/worker'

import { getMusicPic } from '../music'

export const getListsCover = async (ids: string[]) => {
  return _getListsCover(ids, getMusicPic)
}

export const initMusicList = async () => {
  await _initMusicList(
    workers.dbService,
    async () => {
      return getStore(STORE_NAMES.LIST_SCROLL_POSITION).getAll()
    },
    async (info) => {
      getStore(STORE_NAMES.LIST_SCROLL_POSITION).override(info)
    }
  )
  musicListEvent.on('list_data_overwrite', async () => {
    clearListCoverCache()
  })
  musicListEvent.on('listAction', async (action) => {
    switch (action.action) {
      case 'list_data_overwrite':
        clearListCoverCache()
        break
      case 'list_music_overwrite':
        clearListCoverCache(action.data.listId)
        break
      case 'list_music_add':
        clearListCoverCache(action.data.id)
        break
      case 'list_music_remove':
        clearListCoverCache(action.data.listId)
        break
      case 'list_music_move':
        clearListCoverCache(action.data.fromId)
        clearListCoverCache(action.data.toId)
        break
      case 'list_music_update_position':
        clearListCoverCache(action.data.listId)
        break
      case 'list_music_clear':
        for (const id of action.data) {
          clearListCoverCache(id)
        }
        break

      default:
        break
    }
  })
}
