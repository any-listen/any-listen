import { throttle } from '@any-listen/common/utils'

import { showMessageBox, t } from '../../common'
import { winMainReadyEvent } from '../../common/event'
import { musicListEvent, sendMusicListAction } from '../../modules/musicList'
import { songlistDetailAll, topSongsDetailAll } from '../resources'
import { workers } from '../worker'
import { extensionEvent } from './event'

const state = {
  initing: false,
  loadedExtensions: [] as string[],
  syncing: false,
  waitingSyncLists: [] as AnyListen.List.OnlineListInfo[],
}

const detailAll = async (list: AnyListen.List.OnlineListInfo) => {
  switch (list.meta.sourceType) {
    case 'songlist':
      return songlistDetailAll(list.meta.extensionId, list.meta.source, list.meta.syncId)
    case 'topSongs':
      return topSongsDetailAll(list.meta.extensionId, list.meta.source, list.meta.syncId, (list.meta.date as string) || '')
    default:
      throw new Error(`Unsupported list source type: ${list.meta.sourceType}`)
  }
}

export const syncList = async (list: AnyListen.List.OnlineListInfo) => {
  // console.log(`Sync list: ${list.name} (${list.id})`)
  const [localMusics, onlineMusics] = await Promise.all([
    workers.dbService.getListMusics(list.id) as Promise<AnyListen.Music.MusicInfoOnline[]>,
    detailAll(list),
  ])
  const localMusicMap = new Map<string, AnyListen.Music.MusicInfoOnline>()
  for (const m of localMusics) localMusicMap.set(m.id, m)
  let isUpdated = false
  const newList = onlineMusics.map((m, i) => {
    const local = localMusicMap.get(m.id)
    if (localMusics[i]?.id !== m.id) isUpdated ||= true
    if (local) return local
    return m
  })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!isUpdated) return
  await sendMusicListAction({
    action: 'list_music_overwrite',
    data: {
      listId: list.id,
      musicInfos: newList,
    },
  })
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
const runSyncList = throttle(async () => {
  if (!state.loadedExtensions.length) return
  // console.log('run list provider sync')
  const extensionList = await workers.extensionService.getLocalExtensionList()
  const userLists = (await workers.dbService.getAllUserLists()).userList
  const filteredExts = new Map<string, Set<string>>()
  const exts = new Map(extensionList.map((e) => [e.id, e]))
  while (state.loadedExtensions.length) {
    const extId = state.loadedExtensions.shift()!
    const ext = exts.get(extId)
    if (!ext?.loaded || !ext.contributes.resource?.length) continue
    let filteredExt = filteredExts.get(ext.id)
    if (!filteredExt) filteredExts.set(ext.id, (filteredExt = new Set()))
    for (const lp of ext.contributes.resource) {
      if (lp.id && lp.resource.length) filteredExt.add(lp.id)
    }
  }
  if (!filteredExts.size) return
  state.waitingSyncLists = Array.from(
    new Set([
      ...state.waitingSyncLists,
      ...(userLists.filter((l) => {
        if (l.type !== 'online') return false
        const ids = filteredExts.get(l.meta.extensionId)
        if (!ids) return false
        if (ids.has(l.meta.source)) return true
        return false
      }) as AnyListen.List.OnlineListInfo[]),
    ])
  )
  void handleSyncList()
}, 500)
export const initListProvider = async () => {
  let initCount = 0
  const handleRunSyncList = () => {
    initCount++
    if (initCount < 2) runSyncList()
  }
  winMainReadyEvent.on(handleRunSyncList)
  extensionEvent.on('extensionEvent', (event) => {
    switch (event.action) {
      case 'starting':
        state.initing = true
        break
      case 'started':
        state.initing = false
        handleRunSyncList()
        break
      case 'loaded':
        state.loadedExtensions.push(event.data.id)
        if (!state.initing) runSyncList()
        break
      default:
        break
    }
  })
  musicListEvent.on('list_create', async (pos, lists) => {
    for (const list of lists) {
      if (list.type !== 'online') continue
      state.waitingSyncLists.push(list)
    }
    // console.log('run list provider sync after create list', state.initing)
    if (!state.initing) void handleSyncList()
  })
  musicListEvent.on('list_update', async (lists, isSync, isRemote) => {
    if (isSync || isRemote) return
    for (const list of lists) {
      if (list.type !== 'online') continue
      state.waitingSyncLists.push(list)
    }
    // console.log('run list provider sync after update list', state.initing)
    if (!state.initing) void handleSyncList()
  })
}
