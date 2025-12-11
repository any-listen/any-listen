import { throttle } from '@any-listen/common/utils'
import { getSettings, showMessageBox, t } from '../../common'
import { winMainReadyEvent } from '../../common/event'
import { musicListEvent, sendMusicListAction, updateMusicBaseInfo } from '../../modules/musicList'
import { workers } from '../worker'
import { extensionEvent } from './event'

export const verifyListCreate = async (info: AnyListen.List.RemoteListInfo) => {
  await workers.extensionService.listProviderAction('createList', {
    data: info,
    extensionId: info.meta.extensionId,
    source: info.meta.source,
  })
}

export const verifyListUpdate = async (info: AnyListen.List.RemoteListInfo) => {
  await workers.extensionService.listProviderAction('updateList', {
    data: info,
    extensionId: info.meta.extensionId,
    source: info.meta.source,
  })
}

export const verifyListDelete = async (info: AnyListen.List.RemoteListInfo) => {
  await workers.extensionService.listProviderAction('deleteList', {
    data: info,
    extensionId: info.meta.extensionId,
    source: info.meta.source,
  })
}

export const verifyMusicRemove = async (listInfo: AnyListen.List.RemoteListInfo, musics: AnyListen.Music.MusicInfoOnline[]) => {
  if (!listInfo.meta.enabledRemove) return
  await workers.extensionService.listProviderAction('removeListMusics', {
    data: {
      list: listInfo,
      musics,
    },
    extensionId: listInfo.meta.extensionId,
    source: listInfo.meta.source,
  })
}

const state = {
  initing: false,
  loadedExtensions: [] as string[],
  syncing: false,
  waitingSyncLists: [] as AnyListen.List.RemoteListInfo[],
}
export const syncList = async (list: AnyListen.List.RemoteListInfo) => {
  // console.log(`Sync list: ${list.name} (${list.id})`)
  const [musics, ids] = await Promise.all([
    workers.dbService.getListMusics(list.id),
    workers.extensionService.listProviderAction('getListMusicIds', {
      data: list,
      extensionId: list.meta.extensionId,
      source: list.meta.source,
    }),
  ])
  const remoteIds = new Set(ids)
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
  const { musics: newMusics, waitingParseMetadata } = newMusicIds.size
    ? await workers.extensionService.listProviderAction('getMusicInfoByIds', {
        extensionId: list.meta.extensionId,
        source: list.meta.source,
        data: {
          list,
          ids: Array.from(newMusicIds),
        },
      })
    : { musics: [], waitingParseMetadata: false }
  if (removedMusicIds.size) {
    await sendMusicListAction({
      action: 'list_music_remove',
      data: {
        listId: list.id,
        ids: Array.from(removedMusicIds),
        sync: true,
      },
    })
  }
  if (newMusics.length) {
    const addMusicLocationType = getSettings()['list.addMusicLocationType']
    await sendMusicListAction({
      action: 'list_music_add',
      data: {
        addMusicLocationType,
        id: list.id,
        musicInfos: newMusics,
      },
    })
    if (waitingParseMetadata) {
      for (const music of newMusics) {
        await workers.extensionService
          .listProviderAction('parseMusicInfoMetadata', {
            extensionId: list.meta.extensionId,
            source: list.meta.source,
            data: music,
          })
          .then(async (newInfo) => {
            // console.log('Parsed music metadata:', newInfo.name, newInfo.singer, newInfo.meta)
            await updateMusicBaseInfo(list.id, newInfo)
          })
          .catch(() => {
            // console.error('Parse music metadata error:', err)
          })
      }
    }
  }
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
    if (!ext || !ext.loaded || !ext.contributes.listProviders?.length) continue
    let filteredExt = filteredExts.get(ext.id)
    if (!filteredExt) filteredExts.set(ext.id, (filteredExt = new Set()))
    for (const lp of ext.contributes.listProviders) {
      if (lp.id) filteredExt.add(lp.id)
    }
  }
  if (!filteredExts.size) return
  state.waitingSyncLists = Array.from(
    new Set([
      ...state.waitingSyncLists,
      ...(userLists.filter((l) => {
        if (l.type !== 'remote') return false
        const ids = filteredExts.get(l.meta.extensionId)
        if (!ids) return false
        if (ids.has(l.meta.source)) return true
        return false
      }) as AnyListen.List.RemoteListInfo[]),
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
      if (list.type !== 'remote') continue
      state.waitingSyncLists.push(list)
    }
    // console.log('run list provider sync after create list', state.initing)
    if (!state.initing) void handleSyncList()
  })
  musicListEvent.on('list_update', async (lists) => {
    for (const list of lists) {
      if (list.type !== 'remote') continue
      state.waitingSyncLists.push(list)
    }
    // console.log('run list provider sync after update list', state.initing)
    if (!state.initing) void handleSyncList()
  })
}
