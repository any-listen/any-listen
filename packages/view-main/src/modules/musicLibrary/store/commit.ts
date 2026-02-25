import { LIST_IDS } from '@any-listen/common/constants'

// import { overwriteListPosition, overwriteListUpdateInfo, removeListPosition, removeListUpdateInfo } from '@/shared/data'
import { arrPush, arrPushByPosition, arrUnshift } from '@/shared'
import { workers } from '@/worker'

import { musicLibraryEvent } from './event'
import { musicLibraryState } from './state'

export const getSubUserLists = (parentId: AnyListen.List.ParentId) => {
  let targetList = musicLibraryState.userListsMap.get(parentId)
  if (targetList == null) musicLibraryState.userListsMap.set(parentId, (targetList = []))
  return targetList
}

export const userListExist = (id: string) => {
  switch (id) {
    case LIST_IDS.DEFAULT:
    case LIST_IDS.LOVE:
    case LIST_IDS.LAST_PLAYED:
      return true
    default:
      return musicLibraryState.userLists.some((u) => u.id == id)
  }
}

export const setUserListInited = (inited: boolean) => {
  musicLibraryState.userListInited = inited
  musicLibraryEvent.userListInited()
}

export const initUserLists = (info: AnyListen.List.MyAllList) => {
  musicLibraryState.loveList = info.loveList
  musicLibraryState.defaultList = info.defaultList
  musicLibraryState.lastPlayList = info.lastPlayList
  setUserLists(info.userList)
  const changedSubList = new Set<AnyListen.List.ParentId>()
  const changedIds = getAllList().map((l) => {
    changedSubList.add(l.parentId)
    return l.id
  })
  musicLibraryEvent.listChanged(changedIds)
  musicLibraryEvent.listSubListChanged(Array.from(changedSubList))
  setUserListInited(true)
}

export const setUserLists = (lists: AnyListen.List.UserListInfo[]) => {
  musicLibraryState.userLists = lists
  rebuildUserListMap()
  return lists
}

export const setMusicList = (listId: string, musicList: AnyListen.Music.MusicInfo[]) => {
  musicLibraryState.allMusicList.set(listId, musicList)
  return musicList
}

export const getAllList = () => {
  return [
    musicLibraryState.defaultList,
    musicLibraryState.loveList,
    musicLibraryState.lastPlayList,
    ...musicLibraryState.userLists,
  ]
}

const rebuildUserList = () => {
  musicLibraryState.userLists = Array.from(musicLibraryState.userListsMap.values()).flat()
}

const rebuildUserListMap = () => {
  musicLibraryState.userListsMap.clear()
  for (const l of musicLibraryState.userLists) {
    let list = musicLibraryState.userListsMap.get(l.parentId)
    if (!list) musicLibraryState.userListsMap.set(l.parentId, (list = []))
    list.push(l)
  }
}

const removeMusicList = (id: string) => {
  musicLibraryState.allMusicList.delete(id)
}

const createUserList = (info: AnyListen.List.UserListInfo, position: number) => {
  const targetList = getSubUserLists(info.parentId)
  if (position < 0 || position >= targetList.length) {
    targetList.push(info)
  } else {
    targetList.splice(position, 0, info)
  }
  rebuildUserList()
}

const updateDefaultListInfo = (
  list: AnyListen.List.MyDefaultListInfo | AnyListen.List.MyLoveListInfo | AnyListen.List.MyLastPlayListInfo,
  meta:
    | AnyListen.List.UserListInfoByGeneralMeta
    | AnyListen.List.UserListInfoByLocalMeta
    | AnyListen.List.UserListInfoByOnlineMeta
) => {
  list.meta.playCount = meta.playCount
  list.meta.updateTime = meta.updateTime
  list.meta.desc = meta.desc
}
const updateList = ({ name, id, type, meta }: AnyListen.List.UserListInfo) => {
  let targetList
  switch (id) {
    case musicLibraryState.defaultList.id:
      updateDefaultListInfo(musicLibraryState.defaultList, meta)
      break
    case musicLibraryState.loveList.id:
      updateDefaultListInfo(musicLibraryState.loveList, meta)
      break
    case musicLibraryState.lastPlayList.id:
      updateDefaultListInfo(musicLibraryState.lastPlayList, meta)
      break
    default:
      targetList = musicLibraryState.userLists.find((l) => l.id == id)
      if (!targetList) return
      targetList.name = name
      targetList.type = type
      targetList.meta = meta
      break
  }
}
const getAllSubListIds = (id: NonNullable<AnyListen.List.UserListInfo['parentId']>) => {
  const queue = getSubUserLists(id).map((l) => l.id)
  const ids = [...queue]
  while (queue.length) {
    getSubUserLists(queue.shift()!).forEach((l) => {
      const id = l.id
      ids.push(id)
      queue.push(id)
    })
  }
  return ids
}

export const listDataOverwrite = ({ defaultList, loveList, userList, lastPlayList }: AnyListen.List.ListDataFull) => {
  musicLibraryState.allMusicList.clear()

  const { list: defList, ...defInfo } = defaultList
  setMusicList(LIST_IDS.DEFAULT, defList)
  const { list: lovList, ...lovInfo } = loveList
  setMusicList(LIST_IDS.LOVE, lovList)
  const { list: lpList, ...lpInfo } = lastPlayList
  setMusicList(LIST_IDS.LAST_PLAYED, lpList)

  const newUserList = userList.map(({ list, ...listInfo }) => {
    setMusicList(listInfo.id, list)
    return listInfo
  })

  initUserLists({
    defaultList: defInfo,
    loveList: lovInfo,
    lastPlayList: lpInfo,
    userList: newUserList,
  })
  musicLibraryEvent.listMusicChanged(Array.from(musicLibraryState.allMusicList.keys()))
}

export const userListCreate = (info: AnyListen.List.UserListInfo, position: number) => {
  const targetList = getSubUserLists(info.parentId)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!targetList) throw new Error('parent list not found')
  if (targetList.some((item) => item.id == info.id)) throw new Error('duplicate list id')
  createUserList(info, position)
  musicLibraryEvent.listSubListChanged([info.parentId])
}

export const userListsRemove = (ids: string[]) => {
  const changedListIds: string[] = []
  const changedSubListIds = new Set<AnyListen.List.ParentId>()
  const subIds = ids.map((id) => getAllSubListIds(id)).flat()
  const allIds = [...ids, ...subIds]
  for (const id of allIds) {
    const index = musicLibraryState.userLists.findIndex((l) => l.id == id)
    if (index < 0) continue
    const info = musicLibraryState.userLists.splice(index, 1)[0]
    musicLibraryState.userListsMap.delete(id)
    const list = musicLibraryState.userListsMap.get(info.parentId)!
    list.splice(list.indexOf(info), 1)
    changedSubListIds.add(info.parentId)
    changedSubListIds.add(id)
    changedListIds.push(id)
    // if (changeId != null) changedIds.push(changeId)
    // TODO
    // removeListPosition(id)
    // removeListUpdateInfo(id)
    if (!musicLibraryState.allMusicList.has(id)) continue
    removeMusicList(id)
  }

  musicLibraryEvent.listSubListChanged(Array.from(changedSubListIds))
  musicLibraryEvent.listMusicChanged(changedListIds)
}

export const userListsUpdate = (listInfos: AnyListen.List.UserListInfo[]) => {
  if (!listInfos.length) return
  const changedIds: string[] = []
  const changedSubListIds = new Set<AnyListen.List.ParentId>()
  for (const info of listInfos) {
    updateList(info)
    changedIds.push(info.id)
    changedSubListIds.add(info.parentId)
  }
  musicLibraryEvent.listChanged(changedIds)
  musicLibraryEvent.listSubListChanged(Array.from(changedSubListIds))
}

export const userListMove = (toId: AnyListen.List.ParentId, position: number, ids: string[]) => {
  const targetInfo = musicLibraryState.userLists.find((l) => l.id == toId)
  if (!targetInfo) throw new Error('to id not found')
  const targetList = getSubUserLists(toId)
  const changedSubListIds = new Set<AnyListen.List.ParentId>([targetInfo.id])

  const updateLists: AnyListen.List.UserListInfo[] = []
  const now = Date.now()
  let count = 0
  let step = 1 / musicLibraryState.userLists.length
  for (const info of musicLibraryState.userLists) {
    const idx = ids.indexOf(info.id)
    if (idx < 0) continue
    ids.splice(idx, 1)
    changedSubListIds.add(info.parentId)
    info.parentId = toId
    info.meta.posTime = now + count++ * step
    updateLists.push(info)
  }
  position = Math.min(targetList.length, position)
  arrPushByPosition(targetList, updateLists, position)
  rebuildUserListMap()
  musicLibraryEvent.listSubListChanged(Array.from(changedSubListIds))
}

export const userListsUpdatePosition = (position: number, ids: string[]) => {
  let newUserLists = [...musicLibraryState.userLists]

  // console.log(position, ids)

  const updateLists: AnyListen.List.UserListInfo[] = []

  // const targetItem = list[position]
  const map = new Map<string, AnyListen.List.UserListInfo>()
  for (const item of newUserLists) map.set(item.id, item)
  for (const id of ids) {
    const listInfo = map.get(id)!
    listInfo.meta.posTime = Date.now()
    updateLists.push(listInfo)
    map.delete(id)
  }
  newUserLists = newUserLists.filter((mInfo) => map.has(mInfo.id))
  arrPushByPosition(newUserLists, updateLists, Math.min(position, newUserLists.length))

  setUserLists(newUserLists)

  musicLibraryEvent.listSubListChanged([newUserLists[0].parentId])
}

// export const userListsUpdatePlayCount = (id: string, count?: number) => {
//   const targetList = getAllList().find(l => l.id === id)
//   if (!targetList) return

//   if (count == null) targetList.meta.playCount++
//   else targetList.meta.playCount = count
// }

export const listMusicOverwrite = (listId: string, musicInfos: AnyListen.Music.MusicInfo[]): string[] => {
  const isExist = musicLibraryState.allMusicList.has(listId)
  setMusicList(listId, musicInfos)
  return isExist || listId == musicLibraryState.loveList.id ? [listId] : []
}

export const listMusicClear = (ids: string[]): string[] => {
  const changedIds: string[] = []
  for (const id of ids) {
    const list = musicLibraryState.allMusicList.get(id)
    if (!list?.length) continue
    setMusicList(id, [])
    changedIds.push(id)
  }
  return changedIds
}

export const listMusicAdd = (
  id: string,
  musicInfos: AnyListen.Music.MusicInfo[],
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  const targetList = musicLibraryState.allMusicList.get(id)
  if (!targetList) return id == musicLibraryState.loveList.id ? [id] : []

  const listSet = new Set<string>()
  for (const item of targetList) listSet.add(item.id)
  musicInfos = musicInfos.filter((item) => {
    if (listSet.has(item.id)) return false
    listSet.add(item.id)
    return true
  })
  switch (addMusicLocationType) {
    case 'top':
      arrUnshift(targetList, musicInfos)
      break
    case 'bottom':
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check, no-fallthrough
    default:
      arrPush(targetList, musicInfos)
      break
  }

  musicLibraryEvent.listMusicChanged([id])
}

export const listMusicMove = (
  fromId: string,
  toId: string,
  musicInfos: AnyListen.Music.MusicInfo[],
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  listMusicRemove(
    fromId,
    musicInfos.map((musicInfo) => musicInfo.id)
  )
  listMusicAdd(toId, musicInfos, addMusicLocationType)
}

export const listMusicRemove = (listId: string, ids: string[]) => {
  let targetList = musicLibraryState.allMusicList.get(listId)
  if (!targetList) return listId == musicLibraryState.loveList.id ? [listId] : []

  const idsSet = new Set<string>(ids)
  const newList = targetList.filter((mInfo) => !idsSet.has(mInfo.id))
  targetList.splice(0, targetList.length)
  arrPush(targetList, newList)

  musicLibraryEvent.listMusicChanged([listId])
}

export const listMusicUpdateInfo = (musicInfos: AnyListen.IPCList.ListActionMusicUpdate) => {
  const updateList = new Map<string, AnyListen.Music.MusicInfo[]>()
  for (const { id, musicInfo } of musicInfos) {
    const targetList = musicLibraryState.allMusicList.get(id)
    if (!targetList) continue
    const index = targetList.findIndex((l) => l.id == musicInfo.id)
    if (index < 0) continue
    const info: AnyListen.Music.MusicInfo = { ...targetList[index] }
    Object.assign(info, {
      name: musicInfo.name,
      singer: musicInfo.singer,
      interval: musicInfo.interval,
      meta: musicInfo.meta,
    })
    targetList.splice(index, 1, info)
    let list = updateList.get(id)
    if (!list) {
      list = []
      updateList.set(id, list)
    }
    list.push(info)
  }
  musicLibraryEvent.listMusicUpdated(updateList)
  // musicLibraryEvent.listMusicChanged(Array.from(updateList.keys()))
}

export const listMusicUpdatePosition = async (listId: string, position: number, ids: string[]) => {
  let targetList = musicLibraryState.allMusicList.get(listId)
  if (!targetList) return listId == musicLibraryState.loveList.id ? [listId] : []

  // const infos = Array(ids.length)
  // for (let i = targetList.length; i--;) {
  //   const item = targetList[i]
  //   const index = ids.indexOf(item.id)
  //   if (index < 0) continue
  //   infos.splice(index, 1, targetList.splice(i, 1)[0])
  // }
  // targetList.splice(Math.min(position, targetList.length - 1), 0, ...infos)

  // console.time('ts')

  const list = await workers.main.createSortedList(targetList, position, ids)
  setMusicList(listId, list)
  // console.timeEnd('ts')
  musicLibraryEvent.listMusicChanged([listId])
}

export const initFetchingListStatus = (ids: string[]) => {
  for (const id of ids) {
    musicLibraryState.fetchingListStatus[id] = true
    musicLibraryEvent.fetchingListStatusUpdated(id, true)
  }
}

export const setFetchingListStatus = (id: string, status: boolean) => {
  musicLibraryState.fetchingListStatus[id] = status
  musicLibraryEvent.fetchingListStatusUpdated(id, status)
}
