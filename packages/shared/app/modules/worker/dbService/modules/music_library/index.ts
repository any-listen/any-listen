import { LIST_IDS } from '@any-listen/common/constants'
import { arrPush, arrPushByPosition, arrUnshift } from '@any-listen/common/utils'

import {
  deleteUserLists,
  inertUserLists,
  insertMusicInfoList,
  insertMusicInfoListAndRefreshOrder,
  moveMusicInfo,
  moveMusicInfoAndRefreshOrder,
  overwriteListData,
  overwriteMusicInfo,
  queryAllUserList,
  queryDefaultList,
  // queryUserListInfo,
  queryMusicInfoByListId,
  queryMusicInfoByListIdAndMusicInfoId,
  queryMusicInfoByMusicInfoId,
  removeMusicInfoByListId,
  removeMusicInfos,
  updateMusicInfoOrder,
  updateMusicInfos,
  updateUserLists as updateUserListsFromDB,
} from './dbHelper'
import type { MusicInfo, MusicInfoOrder, UserListInfo } from './statements'

let defaultList: AnyListen.List.MyDefaultListInfo | undefined
let loveList: AnyListen.List.MyLoveListInfo
let lastPlayList: AnyListen.List.MyLastPlayListInfo
let userLists: AnyListen.List.UserListInfo[] = []
let musicLists = new Map<string, AnyListen.Music.MusicInfo[]>()

const toDBListInfo = (listInfos: AnyListen.List.MyListInfo[], offset = 0): UserListInfo[] => {
  return listInfos.map((info, index) => {
    return {
      id: info.id,
      name: info.name,
      type: info.type,
      parent_id: info.parentId,
      meta: JSON.stringify(info.meta),
      position: offset + index,
    } satisfies UserListInfo
  })
}

const toDBMusicInfo = (musicInfos: AnyListen.Music.MusicInfo[], listId: string, offset = 0): MusicInfo[] => {
  return musicInfos.map((info, index) => {
    return {
      id: info.id,
      interval: info.interval,
      is_local: info.isLocal ? 1 : 0,
      list_id: listId,
      name: info.name,
      singer: info.singer,
      meta: JSON.stringify(info.meta),
      order: offset + index,
    } satisfies MusicInfo
  })
}

const parseList = <T extends AnyListen.List.UserListInfo>(list: UserListInfo) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { position, parent_id, ...newList } = list
  const listInfo = {
    ...newList,
    parentId: parent_id,
    meta: JSON.parse(newList.meta),
  }
  return listInfo as T
}
/**
 * 初始化列表信息
 * @param parentId 列表id
 * @param force 是否忽略缓存
 * @returns
 */
// const initListInfo = (id: UserListInfo['parentId'], force: boolean = false) => {
//   if (force) userListMap.clear()
//   if (id) {
//     if (userListMap.has(id) && !force) return
//     userListMap.set(DEFAULT_LIST_KEY, querySubUserList(id).map(parseList<AnyListen.List.UserListInfo>))
//   } else {
//     if (defaultList && !force) return
//     let lists = querySubUserList(null)
//     const userList: AnyListen.List.UserListInfo[] = []
//     userListMap.set(DEFAULT_LIST_KEY, userList)
//     for (const list of lists) {
//       const listInfo = parseList(list)
//       if (list.type == LIST_IDS.DEFAULT) {
//         switch (list.id) {
//           case LIST_IDS.DEFAULT:
//             defaultList = listInfo as AnyListen.List.MyDefaultListInfo
//             break
//           case LIST_IDS.LOVE:
//             loveList = listInfo as AnyListen.List.MyLoveListInfo
//             break
//           case LIST_IDS.LAST_PLAYED:
//             lastPlayList = listInfo as AnyListen.List.MyLastPlayListInfo
//             break
//           default:
//             console.warn('unknown list: ' + list.name + ' id: ' + list.id)
//             userList.push(listInfo as AnyListen.List.UserListInfo)
//         }
//       } else {
//         userList.push(listInfo as AnyListen.List.UserListInfo)
//       }
//     }
//   }
// }
const initListInfo = (force = false) => {
  if (defaultList && !force) return
  // userLists = []
  const defaultLists = queryDefaultList()
  for (const list of defaultLists) {
    const listInfo = parseList(list) as unknown
    switch (list.id) {
      case LIST_IDS.DEFAULT:
        defaultList = listInfo as AnyListen.List.MyDefaultListInfo
        break
      case LIST_IDS.LOVE:
        loveList = listInfo as AnyListen.List.MyLoveListInfo
        break
      case LIST_IDS.LAST_PLAYED:
        lastPlayList = listInfo as AnyListen.List.MyLastPlayListInfo
        break
      default:
        console.warn(`unknown list: ${list.name} id: ${list.id}`)
      // userLists.push(listInfo as AnyListen.List.UserListInfo)
    }
  }

  userLists = queryAllUserList().map(parseList<AnyListen.List.UserListInfo>)

  // const lists = queryAllList()
  // const newUserLists: Record<string, AnyListen.List.UserListInfo[]> = {
  //   [DEFAULT_LIST_KEY]: [],
  // }
  // for (const list of lists) {
  //   const listInfo = parseList(list)
  //   if (list.type == LIST_IDS.DEFAULT) {
  //     switch (list.id) {
  //       case LIST_IDS.DEFAULT:
  //         defaultList = listInfo as AnyListen.List.MyDefaultListInfo
  //         break
  //       case LIST_IDS.LOVE:
  //         loveList = listInfo as AnyListen.List.MyLoveListInfo
  //         break
  //       case LIST_IDS.LAST_PLAYED:
  //         lastPlayList = listInfo as AnyListen.List.MyLastPlayListInfo
  //         break
  //       default:
  //         console.warn('unknown list: ' + list.name + ' id: ' + list.id)
  //         newUserLists[DEFAULT_LIST_KEY].push(listInfo as AnyListen.List.UserListInfo)
  //     }
  //   } else {
  //     const id = (listInfo as AnyListen.List.UserListInfo).parentId ?? DEFAULT_LIST_KEY
  //     let lists = newUserLists[id]
  //     if (!lists) lists = newUserLists[id] = []
  //     lists.push(listInfo as AnyListen.List.UserListInfo)
  //   }
  // }
  // userListMap = new Map(Object.entries(newUserLists))
}
const initUserList = (force = false) => {
  userLists = queryAllUserList().map(parseList<AnyListen.List.UserListInfo>)
}

const filterUserLists = (parentId: UserListInfo['parent_id']) => {
  return userLists.filter((l) => l.parentId === parentId)
}
const overwriteUserList = (parentId: UserListInfo['parent_id'], lists: AnyListen.List.UserListInfo[]) => {
  const newList = userLists.filter((l) => l.parentId !== parentId)
  userLists = [...newList, ...lists]
}

/**
 * 获取所有用户列表
 * @returns
 */
export const getAllUserLists = (): AnyListen.List.MyAllList => {
  initListInfo()

  return {
    defaultList: defaultList!,
    loveList,
    lastPlayList,
    userList: userLists,
  }
}

export const getUserListById = (id: string) => {
  initListInfo()
  return userLists.find((l) => l.id === id)
}

/**
 * 获取用户列表
 * @returns
 */
export const getUserLists = (parentId: AnyListen.List.ParentId): AnyListen.List.UserListInfo[] => {
  initListInfo()
  return filterUserLists(parentId)
}

/**
 * 批量创建列表
 * @param position 列表位置
 * @param lists 列表信息
 */
export const createUserLists = (position: number, lists: AnyListen.List.UserListInfo[]) => {
  if (!lists.length) return
  initListInfo()
  const parentId = lists[0].parentId
  const userLists = filterUserLists(parentId)
  if (position < 0 || position >= userLists.length) {
    const newLists: UserListInfo[] = toDBListInfo(lists, userLists.length)
    inertUserLists(parentId, newLists)
  } else {
    const newUserLists = toDBListInfo(userLists)
    arrPushByPosition(newUserLists, toDBListInfo(lists, 0), position)
    newUserLists.forEach((list, index) => {
      list.position = index
    })
    inertUserLists(parentId, newUserLists, true)
  }
  initUserList(true)
}

// const queryParentListInfo = (id: UserListInfo['id']) => {
//   return queryUserListInfo(id)
// }
const getAllSubListIds = (id: NonNullable<UserListInfo['parent_id']>) => {
  // const targetInfo = userLists.find(l => l.id == id)
  // if (!targetInfo) return []
  // const parentId = `${targetInfo.parentId ?? 'null'}${SPLIT_CHAR.LIST_PARENT}`
  // return userLists.filter(l => l.parentId?.startsWith(parentId))
  const queue = filterUserLists(id).map((l) => l.id)
  const ids = [...queue]
  while (queue.length) {
    filterUserLists(queue.shift()!).forEach((l) => {
      const id = l.id
      ids.push(id)
      queue.push(id)
    })
  }
  return ids
}
/**
 * 批量删除列表
 * @param ids 列表ids
 */
export const removeUserLists = (ids: string[]) => {
  initListInfo()
  const subIds = ids.map((id) => getAllSubListIds(id)).flat()
  const allIds = [...ids, ...subIds]
  deleteUserLists(allIds)
  for (const id of allIds) if (musicLists.has(id)) musicLists.delete(id)
  initUserList(true)
}

/**
 * 批量更新列表信息
 * @param lists 列表信息
 */
export const updateUserLists = (lists: AnyListen.List.MyListInfo[]) => {
  const dbList: UserListInfo[] = toDBListInfo(lists, 0)
  updateUserListsFromDB(dbList)
  initListInfo(true)
}

/**
 * 批量移动列表
 * @param id 新列表id
 * @param position 位置
 * @param ids 列表ids
 */
export const moveUserList = (toId: UserListInfo['parent_id'], position: number, ids: string[]) => {
  initListInfo()
  const targetInfo = userLists.find((l) => l.id == toId)
  if (!targetInfo) throw new Error('to id not found')

  const targetList = filterUserLists(toId)

  const updateLists: AnyListen.List.UserListInfo[] = []
  const now = Date.now()
  let count = 0
  let step = 1 / userLists.length
  for (const info of userLists) {
    const idx = ids.indexOf(info.id)
    if (idx < 0) continue
    ids.splice(idx, 1)
    info.parentId = toId
    info.meta.posTime = now + count++ * step
    updateLists.push(info)
  }

  position = Math.min(targetList.length, position)

  arrPushByPosition(targetList, updateLists, position)
  inertUserLists(toId, toDBListInfo(targetList), true)
  initListInfo(true)
}

/**
 * 批量更新列表位置
 * @param position 列表位置
 * @param ids 列表ids
 */
export const updateUserListsPosition = (position: number, ids: string[]) => {
  if (!ids.length) return
  initListInfo()
  const id = ids[0]
  const targetInfo = userLists.find((l) => l.id == id)
  if (!targetInfo) throw new Error(`${id} not found`)
  const targetList = filterUserLists(targetInfo.parentId)

  const updateLists: AnyListen.List.UserListInfo[] = []

  const now = Date.now()
  let step = 1 / targetList.length
  for (let i = targetList.length - 1; i >= 0; i--) {
    if (ids.includes(targetList[i].id)) {
      const list = targetList.splice(i, 1)[0]
      list.meta.posTime = now + i * step
      updateLists.push(list)
    }
  }
  position = Math.min(targetList.length, position)

  arrPushByPosition(targetList, updateLists, position)
  inertUserLists(targetInfo.parentId, toDBListInfo(targetList), true)
  overwriteUserList(targetInfo.parentId, targetList)
}

/**
 * 根据列表ID获取列表内歌曲
 * @param listId 列表ID
 * @returns 列表内歌曲
 */
export const getListMusics = (listId: string): AnyListen.Music.MusicInfo[] => {
  let targetList: AnyListen.Music.MusicInfo[] | undefined = musicLists.get(listId)
  if (targetList == null) {
    targetList = queryMusicInfoByListId(listId).map((info) => {
      return {
        id: info.id,
        name: info.name,
        singer: info.singer,
        isLocal: info.is_local == 1,
        interval: info.interval,
        meta: JSON.parse(info.meta),
      }
    })
    musicLists.set(listId, targetList)
  }

  return targetList
}

export const getListMusicsByIds = (listId: string, ids: string[]) => {
  const list = musicLists.get(listId)
  if (!list) return []
  const idSet = new Set(ids)
  return list.filter((m) => idSet.has(m.id))
}

/**
 * 覆盖列表内的歌曲
 * @param listId 列表id
 * @param musicInfos 歌曲列表
 */
export const musicOverwrite = (listId: string, musicInfos: AnyListen.Music.MusicInfo[]) => {
  let targetList = getListMusics(listId)
  overwriteMusicInfo(listId, toDBMusicInfo(musicInfos, listId))
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (targetList) {
    targetList.splice(0, targetList.length)
    arrPush(targetList, musicInfos)
  }
}

/**
 * 批量添加歌曲
 * @param listId 列表id
 * @param musicInfos 添加的歌曲信息
 * @param addMusicLocationType 添加在到列表的位置
 */
export const musicsAdd = (
  listId: string,
  musicInfos: AnyListen.Music.MusicInfo[],
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  if (![LIST_IDS.DEFAULT, LIST_IDS.LOVE, LIST_IDS.LAST_PLAYED, ...userLists.map((l) => l.id)].includes(listId)) {
    throw new Error(`listId ${listId} not found`)
  }
  let targetList = getListMusics(listId)

  const set = new Set<string>()
  for (const item of targetList) set.add(item.id)
  musicInfos = musicInfos.filter((item) => {
    if (set.has(item.id)) return false
    set.add(item.id)
    return true
  })

  switch (addMusicLocationType) {
    case 'top':
      insertMusicInfoListAndRefreshOrder(
        toDBMusicInfo(musicInfos, listId),
        listId,
        toDBMusicInfo(targetList, listId, musicInfos.length)
      )
      arrUnshift(targetList, musicInfos)
      break
    case 'bottom':
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check, no-fallthrough
    default:
      insertMusicInfoList(toDBMusicInfo(musicInfos, listId, targetList.length))
      arrPush(targetList, musicInfos)
      break
  }
}

/**
 * 批量删除歌曲
 * @param listId 列表Id
 * @param ids 要删除歌曲的id
 */
export const musicsRemove = (listId: string, ids: string[]) => {
  let targetList = getListMusics(listId)
  if (!targetList.length) return
  removeMusicInfos(listId, ids)
  const idsSet = new Set<string>(ids)
  musicLists.set(
    listId,
    targetList.filter((mInfo) => !idsSet.has(mInfo.id))
  )
}

/**
 * 批量移动歌曲
 * @param fromId 源列表id
 * @param toId 目标列表id
 * @param musicInfos 添加的歌曲信息
 * @param addMusicLocationType 添加在到列表的位置
 */
export const musicsMove = (
  fromId: string,
  toId: string,
  musicInfos: AnyListen.Music.MusicInfo[],
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  let fromList = getListMusics(fromId)
  let toList = getListMusics(toId)

  const ids = musicInfos.map((musicInfo) => musicInfo.id)

  let listSet = new Set<string>()
  for (const item of toList) listSet.add(item.id)
  musicInfos = musicInfos.filter((item) => {
    if (listSet.has(item.id)) return false
    listSet.add(item.id)
    return true
  })

  switch (addMusicLocationType) {
    case 'top':
      moveMusicInfoAndRefreshOrder(
        fromId,
        ids,
        toId,
        toDBMusicInfo(musicInfos, toId),
        toDBMusicInfo(toList, toId, musicInfos.length)
      )
      arrUnshift(toList, musicInfos)
      break
    case 'bottom':
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check, no-fallthrough
    default:
      moveMusicInfo(fromId, ids, toDBMusicInfo(musicInfos, toId, toList.length))
      arrPush(toList, musicInfos)
      break
  }

  listSet = new Set<string>(ids)
  musicLists.set(
    fromId,
    fromList.filter((mInfo) => !listSet.has(mInfo.id))
  )
}

/**
 * 批量更新歌曲信息
 * @param musicInfos 歌曲&列表信息
 */
export const musicsUpdate = (musicInfos: AnyListen.IPCList.ListActionMusicUpdate) => {
  updateMusicInfos(
    musicInfos.map(({ id, musicInfo }) => {
      return {
        id: musicInfo.id,
        interval: musicInfo.interval,
        is_local: musicInfo.isLocal ? 1 : 0,
        list_id: id,
        name: musicInfo.name,
        singer: musicInfo.singer,
        meta: JSON.stringify(musicInfo.meta),
        order: 0,
      } satisfies MusicInfo
    })
  )
  for (const { id, musicInfo } of musicInfos) {
    const targetList = musicLists.get(id)
    if (targetList == null) continue
    const targetMusic = targetList.find((item) => item.id == musicInfo.id)
    if (!targetMusic) continue
    targetMusic.name = musicInfo.name
    targetMusic.singer = musicInfo.singer
    targetMusic.isLocal = musicInfo.isLocal
    targetMusic.interval = musicInfo.interval
    targetMusic.meta = musicInfo.meta
  }
}
export const musicsUpdateLastPlayedList = (musicInfos: AnyListen.IPCList.ListActionMusicUpdate) => {
  const notLastPlayedListInfos: AnyListen.IPCList.ListActionMusicUpdate = []
  const lastPlayedListMusicIds = new Set<string>()
  const list = getListMusics(LIST_IDS.LAST_PLAYED)
  for (const musicInfo of list) lastPlayedListMusicIds.add(musicInfo.id)
  for (const info of musicInfos) {
    if (info.id !== LIST_IDS.LAST_PLAYED && lastPlayedListMusicIds.has(info.musicInfo.id)) {
      notLastPlayedListInfos.push({
        musicInfo: info.musicInfo,
        id: LIST_IDS.LAST_PLAYED,
      })
    }
  }
  if (notLastPlayedListInfos.length) musicsUpdate(notLastPlayedListInfos)
  return notLastPlayedListInfos
}

/**
 * 更新歌曲图片
 * @param musicInfos 歌曲&列表信息
 */
export const musicPicUpdate = (listId: string, musicId: string, picUrl: string) => {
  let targetList = musicLists.get(listId)
  if (!targetList) {
    targetList = getListMusics(listId)
    musicLists.set(listId, targetList)
  }
  const musicInfo = targetList.find((item) => item.id == musicId)
  if (!musicInfo) return
  musicInfo.meta.picUrl = picUrl
  musicsUpdate([{ id: listId, musicInfo }])
  return musicInfo
}

/**
 * 更新歌曲基本信息
 * @param musicInfos 歌曲&列表信息
 */
export const musicBaseInfosUpdate = (listId: string, musicInfos: AnyListen.Music.MusicInfo[]) => {
  let targetList = musicLists.get(listId)
  if (!targetList) {
    targetList = getListMusics(listId)
    musicLists.set(listId, targetList)
  }
  const infosMap = new Map<string, AnyListen.Music.MusicInfo>()
  for (const item of musicInfos) infosMap.set(item.id, item)
  let updatedInfos: AnyListen.Music.MusicInfo[] = []
  for (const targetInfo of targetList) {
    const musicInfo = infosMap.get(targetInfo.id)
    if (musicInfo) {
      musicInfo.meta.picUrl ||= targetInfo.meta.picUrl
      updatedInfos.push(musicInfo)
    }
  }
  musicsUpdate(updatedInfos.map((musicInfo) => ({ id: listId, musicInfo })))
  return updatedInfos
}

/**
 * 清空列表内的歌曲
 * @param listId 列表Id
 */
export const musicsClear = (ids: string[]) => {
  removeMusicInfoByListId(ids)
  for (const id of ids) {
    const targetList = musicLists.get(id)
    if (!targetList) continue
    targetList.splice(0, targetList.length)
  }
}

/**
 * 批量更新歌曲位置
 * @param listId 列表id
 * @param position 新位置
 * @param ids 要更新位置的歌曲id
 */
export const musicsPositionUpdate = (listId: string, position: number, ids: string[]) => {
  let targetList = getListMusics(listId)
  if (!targetList.length) return

  let newTargetList = [...targetList]

  const infos: AnyListen.Music.MusicInfo[] = []
  const map = new Map<string, AnyListen.Music.MusicInfo>()
  for (const item of newTargetList) map.set(item.id, item)
  const now = Date.now()
  let i = 0
  let step = 1 / ids.length
  for (const id of ids) {
    const target = map.get(id)
    if (!target) continue
    target.meta.posTime = now + i++ * step
    infos.push(target)
    map.delete(id)
  }
  newTargetList = newTargetList.filter((mInfo) => map.has(mInfo.id))
  arrPushByPosition(newTargetList, infos, Math.min(position, newTargetList.length))

  updateMusicInfoOrder(
    listId,
    newTargetList.map((info, index) => {
      return {
        list_id: listId,
        music_id: info.id,
        order: index,
      } satisfies MusicInfoOrder
    })
  )
  updateMusicInfos(toDBMusicInfo(infos, listId))
  musicLists.set(listId, newTargetList)
}

/**
 * 覆盖所有列表数据
 * @param myListData 完整列表数据
 */
export const listDataOverwrite = (myListData: AnyListen.List.ListDataFull) => {
  initListInfo()
  const dbLists: UserListInfo[] = []
  const listData = { ...myListData }

  const dbMusicInfos: MusicInfo[] = [
    ...toDBMusicInfo(listData.defaultList.list, LIST_IDS.DEFAULT),
    ...toDBMusicInfo(listData.loveList.list, LIST_IDS.LOVE),
    ...toDBMusicInfo(listData.lastPlayList.list, LIST_IDS.LAST_PLAYED),
  ]
  const idxMap = new Map<string | null, number>()
  for (const { list, ...listInfo } of listData.userList) {
    let idx = idxMap.get(listInfo.parentId)
    if (idx == null) idxMap.set(listInfo.parentId, (idx = 0))
    else idx++
    dbLists.push({
      id: listInfo.id,
      name: listInfo.name,
      parent_id: listInfo.parentId,
      type: listInfo.type,
      position: idx,
      meta: JSON.stringify(listInfo.meta),
    } satisfies UserListInfo)
    arrPush(dbMusicInfos, toDBMusicInfo(list, listInfo.id))
  }
  overwriteListData(dbLists, dbMusicInfos)
  updateUserListsFromDB(
    toDBListInfo(
      [listData.defaultList, listData.loveList, listData.lastPlayList].map(({ list, ...listInfo }) => {
        return listInfo
      })
    )
  )

  musicLists.clear()
  musicLists.set(LIST_IDS.DEFAULT, listData.defaultList.list)
  musicLists.set(LIST_IDS.LOVE, listData.loveList.list)
  musicLists.set(LIST_IDS.LAST_PLAYED, listData.lastPlayList.list)
  for (const list of listData.userList) musicLists.set(list.id, list.list)

  initListInfo(true)
}

/**
 * 检查音乐是否存在列表中
 * @param listId 列表id
 * @param musicInfoId 音乐id
 * @returns
 */
export const checkListExistMusic = (listId: string, musicInfoId: string): boolean => {
  const musicInfo = queryMusicInfoByListIdAndMusicInfoId(listId, musicInfoId)
  return musicInfo != null
}

/**
 * 获取所有存在该音乐的列表id
 * @param musicInfoId 音乐id
 * @returns
 */
export const getMusicExistListIds = (musicInfoId: string): string[] => {
  const musicInfos = queryMusicInfoByMusicInfoId(musicInfoId)
  return musicInfos.map((m) => m.list_id)
}
