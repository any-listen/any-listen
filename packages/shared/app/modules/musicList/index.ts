import { LIST_IDS } from '@any-listen/common/constants'
import { arrPush, throttle } from '@any-listen/common/utils'
import { getSettings } from '../../common'
import { getDeviceId } from '../../common/deviceId'
import { sortRemoteUserList, syncRemoteUserList } from '../../modules/extension'
import { workers } from '../worker'
import { proxyCallback, type DBSeriveTypes } from '../worker/utils'
import { initMusicListEvent, musicListEvent } from './event'
import { initLocalListProvider, sortLocalListMusics, syncLocalList } from './localListProvider'

let dbService: DBSeriveTypes
let scrollInfo: Map<string, number>
let getScrollInfo: () => Promise<AnyListen.List.ListPositionInfo>
let saveScrollInfo: (scrollInfo: AnyListen.List.ListPositionInfo) => Promise<void>

export const initMusicList = async (
  _dbService: DBSeriveTypes,
  _getScrollInfo: typeof getScrollInfo,
  _saveScrollInfo: typeof saveScrollInfo
) => {
  dbService = _dbService
  initMusicListEvent(_dbService)
  getScrollInfo = _getScrollInfo
  saveScrollInfo = _saveScrollInfo
  await initLocalListProvider()
}

export const getAllUserLists = async () => {
  return dbService.getAllUserLists()
}

export const getListMusics = async (listId: string) => {
  return dbService.getListMusics(listId)
}

export const getMusicExistListIds = async (musicId: string) => {
  return dbService.getMusicExistListIds(musicId)
}

export const checkListExistMusic = async (listId: string, musicId: string) => {
  return dbService.checkListExistMusic(listId, musicId)
}

const initScrollInfo = async () => {
  // eslint-disable-next-line require-atomic-updates, @typescript-eslint/no-unnecessary-condition
  scrollInfo ??= new Map(Object.entries(await getScrollInfo()))
}
const saveListScrollInfoThrottle = throttle(() => {
  void saveScrollInfo(Object.fromEntries(scrollInfo))
}, 500)
export const getListScrollInfo = async () => {
  await initScrollInfo()
  return Object.fromEntries(scrollInfo)
}
export const saveListScrollPosition = async (id: string, position: number) => {
  await initScrollInfo()
  scrollInfo.set(id, position)
  saveListScrollInfoThrottle()
}
const removeListScrollInfo = async (ids: string[]) => {
  await initScrollInfo()
  for (const id of ids) scrollInfo.delete(id)
  saveListScrollInfoThrottle()
}
const overrideListScrollInfo = async (ids: string[]) => {
  await initScrollInfo()
  for (const id of scrollInfo.keys()) {
    if (ids.includes(id)) continue
    scrollInfo.delete(id)
  }
  saveListScrollInfoThrottle()
}

export const sendMusicListAction = async (action: AnyListen.IPCList.ActionList) => {
  await musicListEvent.listAction(action)
  switch (action.action) {
    case 'list_data_overwrite':
      void overrideListScrollInfo([LIST_IDS.DEFAULT, LIST_IDS.LOVE, ...action.data.userList.map((l) => l.id)])
      break
    case 'list_remove':
      void removeListScrollInfo(action.data)
      break
    default:
  }
}

export const updateMusicPic = async (listId: string, musicInfo: AnyListen.Music.MusicInfo) => {
  await musicListEvent.list_music_update_pic(listId, musicInfo)
}

export const updateMusicBaseInfo = async (listId: string, musicInfo: AnyListen.Music.MusicInfo) => {
  await musicListEvent.list_music_base_info_update(listId, musicInfo)
}

export const onMusicListAction = (listAction: (action: AnyListen.IPCList.ActionList) => Promise<void>): (() => void) => {
  musicListEvent.on('listAction', listAction)
  return () => {
    musicListEvent.off('listAction', listAction)
  }
}

const handleAddMusics = async (listId: string, filePaths: string[], index = -1) => {
  // console.log(index + 1, index + 101)
  const paths = filePaths.slice(index + 1, index + 101)
  const musicInfos = await workers.utilService.createLocalMusicInfos(paths)
  let failedCount = paths.length - musicInfos.length
  if (musicInfos.length) {
    await sendMusicListAction({
      action: 'list_music_add',
      data: { id: listId, musicInfos, addMusicLocationType: getSettings()['list.addMusicLocationType'] },
    })
  }
  index += 100
  if (filePaths.length - 1 > index) {
    failedCount += await handleAddMusics(listId, filePaths, index)
  }
  return failedCount
}

const updateMusicPosition = async (listId: string, ids: string[]) => {
  const musicInfos = await workers.dbService.getListMusics(listId)
  const musicIds = new Set(musicInfos.map((m) => m.id))
  ids = ids.filter((id) => musicIds.has(id))
  await sendMusicListAction({
    action: 'list_music_update_position',
    data: { ids, listId, position: getSettings()['list.addMusicLocationType'] === 'top' ? 0 : musicInfos.length - 1 },
  })
}

const addFolderMusicTasks = new Map<string, () => void>()
export const addFolderMusics = async (listId: string, filePaths: string[], onEnd: (errorMessage?: string | null) => void) => {
  let parsePromise = Promise.resolve(0)
  let files: string[] = []
  const onFilesProxy = proxyCallback(async (paths: string[]) => {
    arrPush(files, paths)
    parsePromise = handleAddMusics(listId, paths)
    await parsePromise
  })
  const onEndProxy = proxyCallback((canceled: boolean) => {
    addFolderMusicTasks.delete(listId)
    void parsePromise.finally(() => {
      void updateMusicPosition(listId, files)
      if (canceled) onEnd(null)
      else onEnd()
    })
  })
  const id = await workers.utilService.scanFolderMusics(filePaths, onFilesProxy, onEndProxy)
  addFolderMusicTasks.set(listId, () => {
    void workers.utilService.stopFolderMusicsScan(id)
    onFilesProxy.releaseProxy()
    onEndProxy.releaseProxy()
  })
  return listId
}
export const cancelAddFolderMusics = async (taskId: string) => {
  const cancel = addFolderMusicTasks.get(taskId)
  if (!cancel) return
  cancel()
}
export const getScanTaksIds = async () => {
  return Array.from(addFolderMusicTasks.keys())
}

export const syncUserList = async (id: string) => {
  const userLists = (await workers.dbService.getAllUserLists()).userList
  const targetList = userLists.find((l) => l.id === id)
  if (!targetList) throw new Error('list not found')
  switch (targetList.type) {
    case 'local':
      if (targetList.meta.deviceId !== getDeviceId()) {
        throw new Error('can not sync local list of other device')
      }
      return syncLocalList(targetList)
    case 'remote':
      return syncRemoteUserList(targetList)
    case 'online':
      // TODO sync online list
      throw new Error('not implemented')
    default:
      console.log('not sync list', targetList)
      throw new Error('not supported list type')
  }
}

export const sortListMusics = async (
  id: string,
  list: AnyListen.Music.MusicInfo[],
  type: AnyListen.List.SortFileType
): Promise<string[]> => {
  const userLists = (await workers.dbService.getAllUserLists()).userList
  const targetList = userLists.find((l) => l.id === id)
  if (!targetList) throw new Error('list not found')
  switch (targetList.type) {
    case 'local':
      if (targetList.meta.deviceId !== getDeviceId()) {
        throw new Error('can not sync local list of other device')
      }
      return sortLocalListMusics(targetList, list as AnyListen.Music.MusicInfoLocal[], type)
    case 'remote':
      return sortRemoteUserList(targetList, list as AnyListen.Music.MusicInfoOnline[], type)
    default:
      console.log('not sync list', targetList)
      throw new Error('not supported list type')
  }
}

export { musicListEvent }
