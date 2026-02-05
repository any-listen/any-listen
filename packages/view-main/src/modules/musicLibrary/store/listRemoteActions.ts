/* eslint-disable @typescript-eslint/naming-convention */
import { sendListAction } from '@/shared/ipc/list'
// import { PLAYER_EVENT_NAME } from '@/shared/ipcNames'
import { settingState } from '@/modules/setting/store/state'
import { listActionEvent } from '@/shared/ipc/list/event'
import {
  listDataOverwrite,
  listMusicAdd,
  listMusicClear,
  listMusicMove,
  listMusicOverwrite,
  listMusicRemove,
  listMusicUpdateInfo,
  listMusicUpdatePosition,
  userListCreate,
  userListMove,
  userListsRemove,
  userListsUpdate,
  userListsUpdatePosition,
} from './commit'

export {
  checkListExistMusic,
  getAllList,
  getListMusics,
  getListPrevSelectId,
  getListScrollPosition,
  getMusicExistListIds,
  parseMusicMetadata,
  saveListPrevSelectId,
  saveListScrollPosition,
  sortListMusics,
  syncUserList,
} from '@/shared/ipc/list'

/**
 * 添加用户列表
 * @param data
 */
export const createUserList = async (data: AnyListen.IPCList.ListActionAdd) => {
  await sendListAction({ action: 'list_create', data })
}

/**
 * 移除用户列表及列表内歌曲
 * @param data
 */
export const removeUserList = async (data: AnyListen.IPCList.ListActionRemove) => {
  await sendListAction({ action: 'list_remove', data })
}

/**
 * 更新用户列表
 * @param data
 */
export const updateUserList = async (data: AnyListen.IPCList.ListActionUpdate) => {
  await sendListAction({ action: 'list_update', data })
}

/**
 * 批量移动用户列表位置
 * @param data
 */
export const updateUserListPosition = async (data: AnyListen.IPCList.ListActionUpdatePosition) => {
  await sendListAction({ action: 'list_update_position', data })
}

/**
 * 批量添加歌曲到列表
 * @param data
 */
export const addListMusics = async (data: AnyListen.IPCList.ListActionMusicAdd) => {
  await sendListAction({ action: 'list_music_add', data })
}

/**
 * 跨列表批量移动歌曲
 * @param data
 */
export const moveListMusics = async (data: AnyListen.IPCList.ListActionMusicMove) => {
  await sendListAction({ action: 'list_music_move', data })
}

/**
 * 批量删除列表内歌曲
 * @param data
 */
export const removeListMusics = async (data: AnyListen.IPCList.ListActionMusicRemove) => {
  await sendListAction({ action: 'list_music_remove', data })
}

/**
 * 批量更新列表内歌曲
 * @param data
 */
export const updateListMusics = async (data: AnyListen.IPCList.ListActionMusicUpdate) => {
  await sendListAction({ action: 'list_music_update', data })
}

/**
 * 批量移动列表内歌曲的位置
 * @param data
 */
export const updateListMusicsPosition = async (data: AnyListen.IPCList.ListActionMusicUpdatePosition) => {
  await sendListAction({ action: 'list_music_update_position', data })
}

/**
 * 覆盖列表内的歌曲
 * @param data
 */
export const overwriteListMusics = async (data: AnyListen.IPCList.ListActionMusicOverwrite) => {
  await sendListAction({ action: 'list_music_overwrite', data })
}

/**
 * 清空列表内的歌曲
 * @param ids
 */
export const clearListMusics = async (ids: AnyListen.IPCList.ListActionMusicClear) => {
  await sendListAction({ action: 'list_music_clear', data: ids })
}

/**
 * 覆盖全部列表数据
 * @param data
 */
export const overwriteListFull = async (data: AnyListen.IPCList.ListActionDataOverwrite) => {
  await sendListAction({ action: 'list_data_overwrite', data })
}

export const registerListAction = () => {
  const list_data_overwrite = (datas: AnyListen.IPCList.ListActionDataOverwrite) => {
    listDataOverwrite(datas)
  }
  const list_create = ({ position, listInfos }: AnyListen.IPCList.ListActionAdd) => {
    for (const list of listInfos) {
      userListCreate(list, position)
    }
  }
  const list_remove = (ids: AnyListen.IPCList.ListActionRemove) => {
    userListsRemove(ids)
  }
  const list_update = (listInfos: AnyListen.IPCList.ListActionUpdate) => {
    userListsUpdate(listInfos)
  }
  const list_move = ({ id, ids, position }: AnyListen.IPCList.ListActionMove) => {
    userListMove(id, position, ids)
  }
  const list_update_position = ({ position, ids }: AnyListen.IPCList.ListActionUpdatePosition) => {
    userListsUpdatePosition(position, ids)
  }
  // const list_update_play_count = ({ id, count }: AnyListen.IPCList.ListActionUpdatePlayCount) => {
  //   userListsUpdatePlayCount(id, count)
  //   musicLibraryEvent.listChanged([id])
  // }
  // const list_update_play_time = ({ position, ids }: AnyListen.IPCList.ListActionUpdatePosition) => {
  //   userListsUpdatePosition(position, ids)
  // }
  const list_music_add = ({ id, musicInfos, addMusicLocationType }: AnyListen.IPCList.ListActionMusicAdd) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    addMusicLocationType ??= settingState.setting['list.addMusicLocationType']
    listMusicAdd(id, musicInfos, addMusicLocationType)
  }
  const list_music_move = ({ fromId, toId, musicInfos, addMusicLocationType }: AnyListen.IPCList.ListActionMusicMove) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    addMusicLocationType ??= settingState.setting['list.addMusicLocationType']
    listMusicMove(fromId, toId, musicInfos, addMusicLocationType)
  }
  const list_music_remove = ({ listId, ids }: AnyListen.IPCList.ListActionMusicRemove) => {
    console.log(listId, ids)
    listMusicRemove(listId, ids)
  }
  const list_music_update = (musicInfos: AnyListen.IPCList.ListActionMusicUpdate) => {
    listMusicUpdateInfo(musicInfos)
    // listMusicUpdateInfo(musicInfos)
    // if (updatedListIds.length) musicLibraryEvent.listMusicChanged(updatedListIds)
  }
  const list_music_update_position = ({ listId, position, ids }: AnyListen.IPCList.ListActionMusicUpdatePosition) => {
    void listMusicUpdatePosition(listId, position, ids)
  }
  const list_music_overwrite = ({ listId, musicInfos }: AnyListen.IPCList.ListActionMusicOverwrite) => {
    listMusicOverwrite(listId, musicInfos)
  }
  const list_music_clear = (ids: AnyListen.IPCList.ListActionMusicClear) => {
    listMusicClear(ids)
  }

  return listActionEvent.on((action): void => {
    // console.log('receive list action', action.action, action)
    switch (action.action) {
      case 'list_data_overwrite':
        list_data_overwrite(action.data)
        break
      case 'list_create':
        list_create(action.data)
        break
      case 'list_remove':
        list_remove(action.data)
        break
      case 'list_update':
        list_update(action.data)
        break
      case 'list_move':
        list_move(action.data)
        break
      case 'list_update_position':
        list_update_position(action.data)
        break
      // case 'list_update_play_count':
      //   list_update_play_count(action.data)
      //   break
      case 'list_music_add':
        list_music_add(action.data)
        break
      case 'list_music_move':
        list_music_move(action.data)
        break
      case 'list_music_remove':
        list_music_remove(action.data)
        break
      case 'list_music_update':
        list_music_update(action.data)
        break
      case 'list_music_update_position':
        list_music_update_position(action.data)
        break
      case 'list_music_overwrite':
        list_music_overwrite(action.data)
        break
      case 'list_music_clear':
        list_music_clear(action.data)
        break
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default:
        console.warn('unknown action:', action)
        // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
        let unknownAction: never = action
    }
  })
}
