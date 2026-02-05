import * as commit from './commit'
import { musicLibraryState } from './state'

import { showNotify } from '@/components/apis/notify'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { generateIdSimple, throttle } from '@/shared'
import { musicLibraryEvent } from './event'
import {
  addListMusics as addListMusicsFromRemote,
  checkListExistMusic as checkListExistMusicFromRemote,
  createUserList as createUserListFromRemote,
  getAllList as getAllListFromRemote,
  getListMusics as getListMusicsFromRemote,
  getListScrollPosition as getListScrollPositionRemote,
  getMusicExistListIds as getMusicExistListIdsFromRemote,
  moveListMusics as moveListMusicsFromRemote,
  removeListMusics as removeListMusicsFromRemote,
  saveListScrollPosition as saveListScrollPositionRemote,
  updateListMusics as updateListMusicsFromRemote,
  updateUserList as updateUserListFromRemote,
  updateUserListPosition as updateUserListPositionFromRemote,
} from './listRemoteActions'

export { getSubUserLists, setFetchingListStatus, setUserListInited, userListExist } from './commit'
export { parseMusicMetadata, removeUserList, sortListMusics, syncUserList, updateListMusicsPosition } from './listRemoteActions'

/**
 * 获取所有列表
 */
export const getAllList = async () => {
  const userLists = await getUserLists()
  console.log(userLists)

  return userLists
}

/**
 * 获取用户列表
 * @returns 所有用户列表
 */
export const getUserLists = async () => {
  if (musicLibraryState.userListInited) return commit.getAllList()
  const allList = await getAllListFromRemote()
  console.log(allList)
  commit.initUserLists(allList)
  // commit.initFetchingListStatus(fetchingIds)
  return commit.getAllList()
}

// TODO create other list
export const createUserList = async (position: number, info: AnyListen.List.UserListInfo) => {
  switch (info.type) {
    case 'general':
      await createUserListFromRemote({
        position,
        listInfos: [
          {
            id: generateIdSimple(),
            type: info.type,
            name: info.name,
            // TODO
            parentId: null,
            meta: {
              createTime: Date.now(),
              desc: '',
              playCount: 0,
              posTime: Date.now(),
              updateTime: Date.now(),
            },
          },
        ],
      })
      break
    case 'local': {
      const listInfo: AnyListen.List.LocalListInfo = {
        id: generateIdSimple(),
        type: info.type,
        name: info.name,
        parentId: null,
        meta: {
          ...info.meta,
          createTime: Date.now(),
          desc: '',
          playCount: 0,
          posTime: Date.now(),
          updateTime: Date.now(),
        },
      }
      await createUserListFromRemote({
        position,
        listInfos: [listInfo],
      })
      break
    }
    case 'remote': {
      const listInfo = {
        id: generateIdSimple(),
        type: info.type,
        name: info.name,
        parentId: null,
        meta: {
          ...info.meta,
          createTime: Date.now(),
          desc: '',
          playCount: 0,
          posTime: Date.now(),
          updateTime: Date.now(),
        },
      }
      await createUserListFromRemote({
        position,
        listInfos: [listInfo],
      })
      break
    }
    default:
      break
  }
}

// TODO update other list
export const updateUserList = async (info: AnyListen.List.UserListInfo) => {
  const targetList = musicLibraryState.userLists.find((l) => l.id === info.id)
  if (!targetList) return
  switch (targetList.type) {
    case 'general':
      await updateUserListFromRemote([
        {
          ...targetList,
          name: info.name,
          meta: {
            ...targetList.meta,
            updateTime: Date.now(),
          },
        },
      ])
      break
    case 'local': {
      const listInfo = {
        ...targetList,
        name: info.name,
        meta: {
          ...targetList.meta,
          ...info.meta,
          updateTime: Date.now(),
        },
      }
      await updateUserListFromRemote([listInfo])
      break
    }
    case 'remote': {
      const listInfo = {
        ...targetList,
        name: info.name,
        meta: {
          ...targetList.meta,
          ...info.meta,
          updateTime: Date.now(),
        },
      }
      await updateUserListFromRemote([listInfo])
      break
    }
    default:
      break
  }
}

export const updateUserListPosition = async (id: string, position: number) => {
  return updateUserListPositionFromRemote({ ids: [id], position })
}

export const addListMusics = async (id: string, musicInfos: AnyListen.Music.MusicInfo[]) => {
  return addListMusicsFromRemote({ id, musicInfos, addMusicLocationType: settingState.setting['list.addMusicLocationType'] })
}

export const moveListMusics = async (fromId: string, toId: string, musicInfos: AnyListen.Music.MusicInfo[]) => {
  return moveListMusicsFromRemote({
    fromId,
    toId,
    musicInfos,
    addMusicLocationType: settingState.setting['list.addMusicLocationType'],
  }).catch((err: Error) => {
    showNotify(i18n.t('lists__music_move_failed', { err: err.message }))
    throw err
  })
}

export const removeListMusics = async (listId: string, ids: string[]) => {
  musicLibraryEvent.listMusicRemovedBefore(listId, ids)
  return removeListMusicsFromRemote({ listId, ids }).catch((err: Error) => {
    showNotify(i18n.t('lists__music_remove_failed', { err: err.message }))
    throw err
  })
}

export const updateListMusic = async (listId: string, musicInfo: AnyListen.Music.MusicInfo) => {
  return updateListMusicsFromRemote([{ id: listId, musicInfo }]).catch((err: Error) => {
    showNotify(i18n.t('lists__music_update_failed', { err: err.message }))
    throw err
  })
}

/**
 * 获取列表内的歌曲
 * @param listId
 * @param forceUpdate 是否强制更新
 */
export const getListMusics = async (listId: string | null, forceUpdate = false): Promise<AnyListen.Music.MusicInfo[]> => {
  if (!listId) return []
  if (!forceUpdate && musicLibraryState.allMusicList.has(listId)) return musicLibraryState.allMusicList.get(listId)!
  const list = await getListMusicsFromRemote(listId).catch((err: Error) => {
    showNotify(i18n.t('lists__music_load_failed', { err: err.message }))
    throw err
  })
  return commit.setMusicList(listId, list)
}

/**
 * 获取列表内的歌曲
 * @param listId
 */
export const getListMusicsSync = (listId: string | null): AnyListen.Music.MusicInfo[] => {
  if (!listId) return []
  return musicLibraryState.allMusicList.has(listId) ? musicLibraryState.allMusicList.get(listId)! : []
}

/**
 * 检查音乐是否存在列表中
 * @param listId
 * @param musicInfoId
 */
export const checkListExistMusic = async (listId: string, musicInfoId: string): Promise<boolean> => {
  return checkListExistMusicFromRemote(listId, musicInfoId)
}

/**
 * 获取所有存在该音乐的列表id
 * @param musicInfoId
 */
export const getMusicExistListIds = async (musicInfoId: string): Promise<string[]> => {
  return getMusicExistListIdsFromRemote(musicInfoId)
}

let listPositionInfo: AnyListen.List.ListPositionInfo
let waitSavePosInfo: AnyListen.List.ListPositionInfo = {}
const initListScrollPositionData = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (listPositionInfo) return
  // eslint-disable-next-line require-atomic-updates
  listPositionInfo = await getListScrollPositionRemote()
}
const saveListPositionThrottle = throttle(() => {
  for (const [id, pos] of Object.entries(waitSavePosInfo)) {
    void saveListScrollPositionRemote(id, pos)
  }
  waitSavePosInfo = {}
}, 500)
export const getListScrollPosition = async (listId: string) => {
  await initListScrollPositionData()
  return listPositionInfo[listId] ?? 0
}
export const saveListScrollPosition = async (listId: string, pos: number) => {
  await initListScrollPositionData()
  listPositionInfo[listId] = pos
  waitSavePosInfo[listId] = pos
  saveListPositionThrottle()
}
