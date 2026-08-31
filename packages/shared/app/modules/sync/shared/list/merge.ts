import { CANCELED_ERROR_MSG } from '@any-listen/common/constants'

import { getDeviceId } from '../../../../common/deviceId'

const mergeMusicList = (
  sourceList: AnyListen.Music.MusicInfo[],
  targetList: AnyListen.Music.MusicInfo[],
  addMusicLocationType: AnyListen.AddMusicLocationType
) => {
  const map = new Map<string, AnyListen.Music.MusicInfo>()
  const ids: string[] = []
  const deviceId = getDeviceId()
  for (const item of sourceList) {
    ids.push(item.id)
    map.set(item.id, item)
  }
  switch (addMusicLocationType) {
    case 'top':
      for (let i = targetList.length - 1; i > -1; i--) {
        const item = targetList[i]
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
    default:
      for (const item of targetList) {
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
  return ids.map((id) => map.get(id)!)
}

type ListInfoFull = AnyListen.List.MyDefaultListInfoFull | AnyListen.List.MyLoveListInfoFull | AnyListen.List.UserListInfoFull
const mergeUserList = <T extends ListInfoFull>(
  sourceListData: T,
  targetListData: T,
  addMusicLocationType: AnyListen.AddMusicLocationType
): T => {
  let list: AnyListen.Music.MusicInfo[]
  if (sourceListData.type === 'default' || sourceListData.type === 'general') {
    list = mergeMusicList(sourceListData.list, targetListData.list, addMusicLocationType)
  } else {
    const sourceListDataTime = sourceListData.meta.syncTime || 0
    const targetListDataTime = 'syncTime' in targetListData.meta ? targetListData.meta.syncTime : 0
    const targetListDataTimeMax = Math.max(sourceListDataTime, targetListDataTime)
    const targetList =
      targetListDataTimeMax === sourceListDataTime
        ? sourceListData
        : targetListDataTimeMax === targetListDataTime
          ? targetListData
          : sourceListData
    list = targetList.list
  }
  const selectedList = sourceListData.meta.updateTime > targetListData.meta.updateTime ? sourceListData : targetListData
  const newInfo: T = {
    ...selectedList,
    meta: {
      ...selectedList.meta,
      playCount: sourceListData.meta.playCount + targetListData.meta.playCount,
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

const mergeList = (
  sourceListData: AnyListen.List.ListDataFull,
  targetListData: AnyListen.List.ListDataFull,
  addMusicLocationType: AnyListen.AddMusicLocationType
): AnyListen.List.ListDataFull => {
  const newListData: AnyListen.List.ListDataFull = {
    defaultList: mergeUserList(sourceListData.defaultList, targetListData.defaultList, addMusicLocationType),
    loveList: mergeUserList(sourceListData.loveList, targetListData.loveList, addMusicLocationType),
    userList: [],
  }

  const sourceListDataObj = createUserListDataObj(sourceListData)
  const targetListDataObj = createUserListDataObj(targetListData)

  let newUserList: AnyListen.List.UserListInfoFull[] = []
  for (const list of sourceListData.userList) {
    const targetList = targetListDataObj.get(list.id)
    newUserList.push(targetList ? mergeUserList(list, targetList, addMusicLocationType) : { ...list })
  }

  targetListData.userList.forEach((list, index) => {
    const targetListUpdateTime = list.meta.posTime || 0
    if (sourceListDataObj.has(list.id)) {
      const sourceListUpdateTime = sourceListDataObj.get(list.id)!.meta.posTime || 0
      if (sourceListUpdateTime >= targetListUpdateTime) return
      // 调整位置
      const [newList] = newUserList.splice(
        newUserList.findIndex((l) => l.id == list.id),
        1
      )
      newList.meta.posTime = targetListUpdateTime
      newUserList.splice(index, 0, newList)
    } else if (targetListUpdateTime) {
      newUserList.splice(index, 0, { ...list })
    } else {
      newUserList.push({ ...list })
    }
  })
  newListData.userList = newUserList

  return newListData
}
const overwriteList = (
  sourceListData: AnyListen.List.ListDataFull,
  targetListData: AnyListen.List.ListDataFull
): AnyListen.List.ListDataFull => {
  const newListData: AnyListen.List.ListDataFull = {
    defaultList: sourceListData.defaultList,
    loveList: sourceListData.loveList,
    userList: [],
  }

  const sourceListDataObj = createUserListDataObj(sourceListData)
  newListData.userList = [...sourceListData.userList]

  targetListData.userList.forEach((list, index) => {
    if (sourceListDataObj.has(list.id)) return

    if (list.meta.posTime) {
      newListData.userList.splice(index, 0, list)
    } else {
      newListData.userList.push(list)
    }
  })

  return newListData
}

const handleMergeListData = async (
  remoteListData: AnyListen.List.ListDataFull,
  addMusicLocationType: AnyListen.AddMusicLocationType,
  getListMergeMode: () => Promise<AnyListen.List.MergeMode>,
  getLocalListData: () => Promise<AnyListen.List.ListDataFull>
): Promise<[AnyListen.List.ListDataFull, boolean, boolean]> => {
  let now = performance.now()
  const mode = await getListMergeMode()

  if (mode == 'cancel') throw new Error(CANCELED_ERROR_MSG)
  if (performance.now() - now > 120_000) throw new Error('getListMergeMode timeout')
  console.log('handleMergeListData', 'remoteListData, localListData')
  let listData: AnyListen.List.ListDataFull
  let requiredUpdateLocalListData = true
  let requiredUpdateRemoteListData = true
  switch (mode) {
    case 'merge_local_remote':
      listData = mergeList(await getLocalListData(), remoteListData, addMusicLocationType)
      break
    case 'merge_remote_local':
      listData = mergeList(remoteListData, await getLocalListData(), addMusicLocationType)
      break
    case 'overwrite_local_remote':
      listData = overwriteList(await getLocalListData(), remoteListData)
      break
    case 'overwrite_remote_local':
      listData = overwriteList(remoteListData, await getLocalListData())
      break
    case 'overwrite_local_remote_full':
      listData = await getLocalListData()
      requiredUpdateLocalListData = false
      break
    case 'overwrite_remote_local_full':
      listData = remoteListData
      requiredUpdateRemoteListData = false
      break
    // case 'none': return null
    // case 'cancel':
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    default:
      throw new Error(CANCELED_ERROR_MSG)
  }
  return [listData, requiredUpdateLocalListData, requiredUpdateRemoteListData]
}

const checkListDataEmpty = (listData: AnyListen.List.ListDataFull): boolean => {
  return !listData.defaultList.list.length && !listData.loveList.list.length && !listData.userList.length
}
export const mergeFullData = async (
  localListData: AnyListen.List.ListDataFull,
  remoteListData: AnyListen.List.ListDataFull,
  addMusicLocationType: AnyListen.AddMusicLocationType,
  getListMergeMode: () => Promise<AnyListen.List.MergeMode>,
  getLocalListData: () => Promise<AnyListen.List.ListDataFull>
): Promise<
  [mergedData: AnyListen.List.ListDataFull, requiredUpdateLocalListData: boolean, requiredUpdateRemoteListData: boolean]
> => {
  if (checkListDataEmpty(localListData)) {
    if (checkListDataEmpty(remoteListData)) {
      return [localListData, false, false]
    }
    return [remoteListData, true, false]
  }
  if (checkListDataEmpty(remoteListData)) {
    return [localListData, false, true]
  }
  return handleMergeListData(remoteListData, addMusicLocationType, getListMergeMode, getLocalListData)
}
