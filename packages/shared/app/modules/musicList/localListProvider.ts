import { throttle } from '@any-listen/common/utils'
import { checkPath } from '@any-listen/nodejs'
import type { FileAction } from '@any-listen/nodejs/watcher'
import { getSettings, showMessageBox, t } from '../../common'
import { getDeviceId } from '../../common/deviceId'
import { winMainReadyEvent } from '../../common/event'
import { workers } from '../worker'
import { proxyCallback } from '../worker/utils'
import { musicListEvent } from './event'

export const verifyLocalListCreate = async (info: AnyListen.List.LocalListInfo) => {
  await checkPath(info.meta.path, true)
}

export const verifyLocalListUpdate = async (info: AnyListen.List.LocalListInfo) => {
  if (info.meta.deviceId !== getDeviceId()) return
  await checkPath(info.meta.path, true)
}

export const verifyLocalListMusicRemove = async (
  listInfo: AnyListen.List.LocalListInfo,
  musics: AnyListen.Music.MusicInfoLocal[]
) => {
  if (!listInfo.meta.enabledRemove || listInfo.meta.deviceId !== getDeviceId()) return
  if (musics.length > 1) {
    const confirm = await showMessageBox({
      type: 'warning',
      modal: true,
      title: t('extension.list_provider.local_list_remove_music_files_confirm_title'),
      detail: t('extension.list_provider.local_list_remove_music_files_confirm', {
        name: listInfo.name,
        count: musics.length,
      }),
      buttons: [{ text: t('cancel_button_text_2') }, { text: t('confirm_button_text') }],
    })
    if (confirm != 1) throw new Error(t('extension.list_provider.local_list_remove_music_files_cancelled'))
  }
  await workers.utilService.removeMusicFiles(musics.map((m) => m.meta.filePath))
}

const watcherMap = new Map<string, [string, () => Promise<void>]>() // listId => [watchPath, unwatch]
const removeWatcher = async (listId: string) => {
  const unwatch = watcherMap.get(listId)
  if (!unwatch) return
  await unwatch[1]()
  watcherMap.delete(listId)
}
export const verifyLocalListDelete = async (info: AnyListen.List.LocalListInfo) => {
  await removeWatcher(info.id)
}

const state = {
  syncing: false,
  waitingSyncLists: [] as AnyListen.List.LocalListInfo[],
}
const handleAddMusics = async (listId: string, filePaths: string[], index = -1) => {
  // console.log(index + 1, index + 101)
  const paths = filePaths.slice(index + 1, index + 101)
  const musicInfos = await workers.utilService.createLocalMusicInfos(paths)
  let failedCount = paths.length - musicInfos.length
  if (musicInfos.length) {
    const addMusicLocationType = index > -1 ? 'bottom' : getSettings()['list.addMusicLocationType']
    await musicListEvent.listAction({
      action: 'list_music_add',
      data: {
        addMusicLocationType,
        id: listId,
        musicInfos,
      },
    })
  }
  index += 100
  if (filePaths.length - 1 > index) {
    failedCount += await handleAddMusics(listId, filePaths, index)
  }
  return failedCount
}
const handleChangeMusics = async (listId: string, filePaths: string[], index = -1) => {
  // console.log(index + 1, index + 101)
  const paths = filePaths.slice(index + 1, index + 101)
  const musicInfos = await workers.utilService.createLocalMusicInfos(paths)
  let failedCount = paths.length - musicInfos.length
  if (musicInfos.length) {
    await musicListEvent.listAction({
      action: 'list_music_update',
      data: musicInfos.map((music) => {
        return {
          id: listId,
          musicInfo: music,
        }
      }),
    })
  }
  index += 100
  if (filePaths.length - 1 > index) {
    failedCount += await handleChangeMusics(listId, filePaths, index)
  }
  return failedCount
}
const handleReadyWatcher = async (listId: string, files: string[]) => {
  const musics = await workers.dbService.getListMusics(listId)
  const remoteIds = new Set(files)
  const newMusicIds = new Set<string>()
  const removedMusicIds = new Set<string>()
  const localIds = new Set<string>()
  for (const music of musics) {
    if (!remoteIds.has(music.id)) {
      removedMusicIds.add(music.id)
      continue
    }
    localIds.add(music.id)
  }
  for (const id of remoteIds) {
    if (!localIds.has(id)) {
      newMusicIds.add(id)
    }
  }
  if (removedMusicIds.size) {
    await musicListEvent.listAction({
      action: 'list_music_remove',
      data: {
        listId,
        ids: Array.from(removedMusicIds),
        sync: true,
      },
    })
  }
  await handleAddMusics(listId, Array.from(newMusicIds))
}
const handleMusicAdd = async (listId: string, paths: string[]) => {
  const musics = await workers.dbService.getListMusics(listId)
  const musicIds = new Set(musics.map((m) => m.id))
  const newIds = paths.filter((p) => !musicIds.has(p))
  if (!newIds.length) return
  await handleAddMusics(listId, newIds)
}
const handleMusicRemove = async (listId: string, paths: string[]) => {
  const musics = await workers.dbService.getListMusics(listId)
  const removedIds: string[] = []
  for (const music of musics) {
    if (!paths.includes(music.id)) continue
    removedIds.push(music.id)
  }
  if (!removedIds.length) return
  await musicListEvent.listAction({
    action: 'list_music_remove',
    data: {
      listId,
      ids: removedIds,
      sync: true,
    },
  })
}
const handleMusicChanged = async (listId: string, paths: string[]) => {
  const musics = await workers.dbService.getListMusics(listId)
  const changedIds: string[] = []
  for (const music of musics) {
    if (!paths.includes(music.id)) continue
    changedIds.push(music.id)
  }
  if (!changedIds.length) return
  await handleChangeMusics(listId, changedIds)
}
const syncList = async (list: AnyListen.List.LocalListInfo) => {
  const targetWatch = watcherMap.get(list.id)
  if (targetWatch) {
    if (targetWatch[0] === list.meta.path) return
    await removeWatcher(list.id)
  }
  await checkPath(list.meta.path, true)
  let promiseFuncs: [() => void, (err: Error) => void]
  const promise = new Promise<void>((resolve, reject) => {
    promiseFuncs = [resolve, reject]
  })
  let ready = false
  let addFiles: string[] = []
  let removedFiles: string[] = []
  let changedFiles: string[] = []
  const flushChangedFiles = () => {
    let _addFiles = addFiles
    addFiles = []
    let _removedFiles = removedFiles
    removedFiles = []
    let _changedFiles = changedFiles
    changedFiles = []
    return [_addFiles, _removedFiles, _changedFiles] as const
  }
  const throttledChange = throttle(async () => {
    const [addFiles, removedFiles, changedFiles] = flushChangedFiles()
    for (const id of removedFiles) {
      const idx = addFiles.indexOf(id)
      if (idx !== -1) addFiles.splice(idx, 1)

      const idx2 = changedFiles.indexOf(id)
      if (idx2 !== -1) changedFiles.splice(idx2, 1)
    }
    for (const id of addFiles) {
      const idx = changedFiles.indexOf(id)
      if (idx !== -1) changedFiles.splice(idx, 1)
    }
    // console.log(`Local list watcher change: ${list.name} (${list.id})`, {
    //   add: addFiles.length,
    //   remove: removedFiles.length,
    //   change: changedFiles.length,
    // })
    if (removedFiles.length) await handleMusicRemove(list.id, removedFiles)
    if (addFiles.length) await handleMusicAdd(list.id, addFiles)
    if (changedFiles.length) await handleMusicChanged(list.id, changedFiles)
  }, 1000)
  const onFileProxy = proxyCallback((action: FileAction, path: string) => {
    // console.log(`Local list file ${action}:`, path)
    switch (action) {
      case 'add':
        addFiles.push(path)
        if (ready) throttledChange()
        break
      case 'unlink':
        removedFiles.push(path)
        if (ready) throttledChange()
        break
      case 'change':
        changedFiles.push(path)
        if (ready) throttledChange()
        break
    }
  })
  const onReadyProxy = proxyCallback(async () => {
    const [addFiles, removedFiles] = flushChangedFiles()
    for (const id of removedFiles) {
      const idx = addFiles.indexOf(id)
      if (idx !== -1) addFiles.splice(idx, 1)
    }
    await handleReadyWatcher(list.id, addFiles)
    ready = true
    // console.log(`Local list watcher ready: ${list.name} (${list.id})`)
    promiseFuncs[0]()
  })
  const onErrorProxy = proxyCallback(async (message: string) => {
    const err = new Error(t('extension.list_provider.local_list_watcher_error', { name: list.name, message }))
    promiseFuncs[1](err)
  })
  const id = await workers.utilService.createMusicDirWatcher(list.meta.path, onFileProxy, onReadyProxy, onErrorProxy, {
    recursive: list.meta.includeSubDir,
  })
  watcherMap.set(list.id, [
    list.meta.path,
    async () => {
      await workers.utilService.removeMusicDirWatcher(id)
      onFileProxy.releaseProxy()
      onReadyProxy.releaseProxy()
      onErrorProxy.releaseProxy()
    },
  ])

  return promise
}
const handleSyncList = async () => {
  if (state.syncing || !state.waitingSyncLists.length) return
  state.syncing = true
  while (state.waitingSyncLists.length) {
    // TODO multi sync
    const list = state.waitingSyncLists.shift()!
    await syncList(list).catch((err: Error) => {
      console.error('Sync list error:', err)
      void showMessageBox({
        detail: t('extension.list_provider.get_list_music_ids_error', {
          name: list.name,
          err: err.message,
        }),
      })
    })
  }
  state.syncing = false
}
const runSyncList = async () => {
  // console.log('run local list sync')
  const userLists = (await workers.dbService.getAllUserLists()).userList
  const deviceId = getDeviceId()
  state.waitingSyncLists = Array.from(
    new Set([
      ...state.waitingSyncLists,
      ...(userLists.filter((l) => l.type === 'local' && l.meta.deviceId === deviceId) as AnyListen.List.LocalListInfo[]),
    ])
  )
  void handleSyncList()
}

export const initLocalListProvider = async () => {
  winMainReadyEvent.on(runSyncList)
  musicListEvent.on('list_create', async (pos, lists) => {
    for (const list of lists) {
      if (list.type !== 'local') continue
      state.waitingSyncLists.push(list)
    }
    // console.log('run list provider sync after create list', state.initing)
    void handleSyncList()
  })
  musicListEvent.on('list_update', async (lists) => {
    for (const list of lists) {
      if (list.type !== 'local' || list.meta.deviceId !== getDeviceId()) continue
      await removeWatcher(list.id)
      state.waitingSyncLists.push(list)
    }
    // console.log('run list provider sync after update list', state.initing)
    void handleSyncList()
  })
}

export const syncLocalList = async (list: AnyListen.List.LocalListInfo) => {
  await removeWatcher(list.id)
  await syncList(list)
}
