import { getDeviceId } from '../../../../common/deviceId'

const mergeMusicList = (
  localList: AnyListen.Music.MusicInfo[],
  latestList: AnyListen.Music.MusicInfo[],
  snapshotList: AnyListen.Music.MusicInfo[] | null,
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  const removedListIds = new Set<string | number>()
  const localListItemIds = new Set<string | number>()
  const latestListItemIds = new Set<string | number>()
  for (const m of localList) localListItemIds.add(m.id)
  for (const m of latestList) latestListItemIds.add(m.id)
  if (snapshotList) {
    for (const m of snapshotList) {
      if (!localListItemIds.has(m.id) || !latestListItemIds.has(m.id)) removedListIds.add(m.id)
    }
  }

  const map = new Map<string | number, AnyListen.Music.MusicInfo>()
  const ids = []
  const deviceId = getDeviceId()
  for (const item of localList) {
    if (removedListIds.has(item.id)) continue
    ids.push(item.id)
    map.set(item.id, item)
  }
  switch (addMusicLocationType) {
    case 'top':
      for (let i = latestList.length - 1; i > -1; i--) {
        const item = latestList[i]
        if (removedListIds.has(item.id)) continue
        const targetItem = map.get(item.id)
        if (targetItem) {
          if (item.meta.updateTime >= targetItem.meta.updateTime) {
            map.set(item.id, item)
          } else if (item.isLocal) {
            if (targetItem.meta.deviceId != item.meta.deviceId && targetItem.meta.deviceId != deviceId) {
              map.set(item.id, item)
            }
          }
        } else {
          ids.unshift(item.id)
          map.set(item.id, item)
        }
      }
      break
    // case 'bottom':
    default:
      for (const item of latestList) {
        if (removedListIds.has(item.id)) continue
        const targetItem = map.get(item.id)
        if (targetItem) {
          if (item.meta.updateTime >= targetItem.meta.updateTime) {
            map.set(item.id, item)
          } else if (item.isLocal) {
            if (targetItem.meta.deviceId != item.meta.deviceId && targetItem.meta.deviceId != deviceId) {
              map.set(item.id, item)
            }
          }
        } else {
          ids.push(item.id)
          map.set(item.id, item)
        }
      }
      break
  }
  return ids.map((id) => map.get(id)) as AnyListen.Music.MusicInfo[]
}

type ListInfoFull = AnyListen.List.MyDefaultListInfoFull | AnyListen.List.MyLoveListInfoFull | AnyListen.List.UserListInfoFull
const mergeUserList = <T extends ListInfoFull>(
  localList: T,
  latestList: T,
  snapshotList: T | null | undefined,
  addMusicLocationType: AnyListen.AddMusicLocationType
): T => {
  let list: AnyListen.Music.MusicInfo[]
  if (localList.type === 'default' || localList.type === 'general') {
    list = mergeMusicList(localList.list, latestList.list, snapshotList?.list ?? null, addMusicLocationType)
  } else {
    const localListTime = localList.meta.syncTime || 0
    const latestListTime = 'syncTime' in latestList.meta ? latestList.meta.syncTime : 0
    const snapshotListTime = snapshotList && 'syncTime' in snapshotList.meta ? snapshotList.meta.syncTime : 0
    const latestListTimeMax = Math.max(localListTime, latestListTime, snapshotListTime)
    localList.meta.syncTime = latestListTimeMax
    if ('syncTime' in latestList.meta) latestList.meta.syncTime = latestListTimeMax
    const targetList =
      latestListTimeMax === localListTime
        ? localList
        : latestListTimeMax === latestListTime
          ? latestList
          : (snapshotList ?? localList)
    list = targetList.list
  }
  const selectedList = localList.meta.updateTime > latestList.meta.updateTime ? localList : latestList
  const snapshotPlayCount = snapshotList?.meta.playCount || 0
  let playCount: number
  if (snapshotPlayCount) {
    playCount = localList.meta.playCount - snapshotPlayCount
    if (playCount < 0) {
      playCount = latestList.meta.playCount - snapshotPlayCount + localList.meta.playCount
    } else {
      playCount += latestList.meta.playCount
    }
  } else playCount = localList.meta.playCount + latestList.meta.playCount
  const newInfo: T = {
    ...selectedList,
    meta: {
      ...selectedList.meta,
      playCount,
    },
    list,
  }
  newInfo.meta.songCount = list.length
  return newInfo
}

type UserDataObj = Map<string, AnyListen.List.UserListInfoFull>
const createUserListDataObj = (listData: AnyListen.List.ListDataFull | null): UserDataObj => {
  const userListDataObj: UserDataObj = new Map()
  if (listData) {
    for (const list of listData.userList) userListDataObj.set(list.id, list)
  }
  return userListDataObj
}

export const mergeFullDataFromSnapshot = (
  localListData: AnyListen.List.ListDataFull,
  latestListData: AnyListen.List.ListDataFull,
  snapshotListData: AnyListen.List.ListDataFull | null,
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  const newListData: AnyListen.List.ListDataFull = {
    defaultList: mergeUserList(
      localListData.defaultList,
      latestListData.defaultList,
      snapshotListData?.defaultList ?? null,
      addMusicLocationType
    ),
    loveList: mergeUserList(
      localListData.loveList,
      latestListData.loveList,
      snapshotListData?.loveList ?? null,
      addMusicLocationType
    ),
    userList: [],
  }
  const localUserListData = createUserListDataObj(localListData)
  const latestUserListData = createUserListDataObj(latestListData)
  const snapshotUserListData = createUserListDataObj(snapshotListData)
  const removedListIds = new Set<string | number>()
  const localUserListIds = new Set<string | number>()
  const remoteUserListIds = new Set<string | number>()

  for (const l of localListData.userList) localUserListIds.add(l.id)
  for (const l of latestListData.userList) remoteUserListIds.add(l.id)

  if (snapshotListData) {
    for (const l of snapshotListData.userList) {
      if (!localUserListIds.has(l.id) || !remoteUserListIds.has(l.id)) removedListIds.add(l.id)
    }
  }

  let newUserList: AnyListen.List.UserListInfoFull[] = []
  for (const list of latestListData.userList) {
    if (removedListIds.has(list.id)) continue
    const localList = localUserListData.get(list.id)
    newUserList.push(
      localList ? mergeUserList(localList, list, snapshotUserListData.get(list.id), addMusicLocationType) : { ...list }
    )
  }

  localListData.userList.forEach((list, index) => {
    if (removedListIds.has(list.id)) return
    const localListUpdateTime = list.meta.posTime || 0
    if (latestUserListData.has(list.id)) {
      const latestListUpdateTime = latestUserListData.get(list.id)!.meta.posTime || 0
      if (latestListUpdateTime >= localListUpdateTime) return
      // 调整位置
      const [newList] = newUserList.splice(
        newUserList.findIndex((l) => l.id == list.id),
        1
      )
      newList.meta.posTime = localListUpdateTime
      newUserList.splice(index, 0, newList)
    } else if (localListUpdateTime) {
      newUserList.splice(index, 0, { ...list })
    } else {
      newUserList.push({ ...list })
    }
  })

  newListData.userList = newUserList

  return newListData
  // const key = await setLocalList(socket, newListData)
  // const err = await setRemotelList(socket, newListData, key).catch(err => err)
  // await overwriteRemoteListData(socket, newListData, key, [socket.keyInfo.clientId])
  // if (err) throw err
}
