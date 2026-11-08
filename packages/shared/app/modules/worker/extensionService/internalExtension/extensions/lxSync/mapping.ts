import { extensionState } from '../../../state'
import type {
  LxDislikeAction,
  LxListAction,
  LxListData,
  LxMusicInfo,
  LxMusicQuality,
  LxSource,
  LxUserListInfo,
} from './protocol/types'
import { LIST_IDS } from './protocol/types'

type AnyMusicInfo = AnyListen.Music.MusicInfo

/** Read the whole local list data through the extension ipc bridge */
export const readLocalListData = async (): Promise<AnyListen.List.ListDataFull> => {
  const allLists = await extensionState.remoteFuncs.getAllUserLists()
  const remoteFuncs = extensionState.remoteFuncs
  const [defaultListMusics, loveListMusics, ...userListMusics] = await Promise.all([
    remoteFuncs.getListMusics(LIST_IDS.DEFAULT),
    remoteFuncs.getListMusics(LIST_IDS.LOVE),
    ...allLists.userList.map(async (list) => remoteFuncs.getListMusics(list.id)),
  ])
  return {
    defaultList: { ...allLists.defaultList, list: defaultListMusics },
    loveList: { ...allLists.loveList, list: loveListMusics },
    userList: allLists.userList.map((list, index) => ({ ...list, list: userListMusics[index] })),
  }
}

/** Overwrite the whole local list data through the extension ipc bridge */
export const writeLocalListData = async (data: AnyListen.List.ListDataFull) => {
  await extensionState.remoteFuncs.musicListAction({ action: 'list_data_overwrite', data })
}

/** Read the local dislike rules (one rule per line) through the extension ipc bridge */
export const readLocalDislikeRules = async (): Promise<string> => {
  return (await extensionState.remoteFuncs.getDislikeRules()).trim()
}

/** Apply a dislike action received from the sync server */
export const applyLxDislikeAction = async (action: LxDislikeAction) => {
  switch (action.action) {
    case 'dislike_data_overwrite':
      await extensionState.remoteFuncs.dislikeAction({ action: 'dislike_data_overwrite', data: action.data })
      break
    case 'dislike_music_add':
      await extensionState.remoteFuncs.dislikeAction({ action: 'dislike_music_add', data: action.data })
      break
    case 'dislike_music_clear':
      await extensionState.remoteFuncs.dislikeAction({ action: 'dislike_music_clear' })
      break
  }
}

const toAnyQualitys = (qualitys: LxMusicQuality[] | undefined): AnyListen.Music.MusicQualityType | undefined => {
  if (!qualitys?.length) return undefined
  const result: AnyListen.Music.MusicQualityType = {}
  for (const { type, size } of qualitys) {
    result[type as AnyListen.Music.Quality] = { sizeStr: size }
  }
  return result
}

const toLxQualitys = (qualitys: AnyListen.Music.MusicQualityType | undefined): LxMusicQuality[] | undefined => {
  if (!qualitys) return undefined
  const result: LxMusicQuality[] = Object.entries(qualitys).map(([type, value]) => ({
    type,
    size: value.sizeStr ?? null,
  }))
  return result.length ? result : undefined
}

/** Convert a LX Music music info to an any-listen online/local music info */
export const fromLxMusicInfo = (music: LxMusicInfo): AnyMusicInfo => {
  const createTime = 0
  const updateTime = 0
  const posTime = 0
  const base = {
    id: music.id,
    name: music.name,
    singer: music.singer,
    interval: music.interval,
    meta: {
      musicId: String(music.meta.songId),
      albumName: music.meta.albumName,
      picUrl: music.meta.picUrl ?? null,
      createTime,
      updateTime,
      posTime,
    },
  }
  if (music.source == 'local') {
    return {
      ...base,
      isLocal: true,
      meta: {
        ...base.meta,
        filePath: music.meta.filePath ?? '',
        ext: music.meta.ext ?? '',
        bitrateLabel: null,
        sizeStr: '',
        deviceId: '',
      },
    }
  }
  return {
    ...base,
    isLocal: false,
    meta: {
      ...base.meta,
      source: music.source,
      qualitys: toAnyQualitys(music.qualitys),
    },
  }
}

/** Convert an any-listen music info to a LX Music music info */
export const toLxMusicInfo = (music: AnyMusicInfo): LxMusicInfo => {
  if (music.isLocal) {
    return {
      id: music.id,
      name: music.name,
      singer: music.singer,
      source: 'local',
      interval: music.interval,
      meta: {
        songId: music.meta.musicId,
        albumName: music.meta.albumName,
        picUrl: music.meta.picUrl ?? null,
        filePath: music.meta.filePath,
        ext: music.meta.ext,
      },
    }
  }
  return {
    id: music.id,
    name: music.name,
    singer: music.singer,
    source: music.meta.source as LxSource,
    interval: music.interval,
    meta: {
      songId: music.meta.musicId,
      albumName: music.meta.albumName,
      picUrl: music.meta.picUrl ?? null,
    },
    qualitys: toLxQualitys(music.meta.qualitys),
  }
}

export const toLxListData = (data: AnyListen.List.ListDataFull): LxListData => {
  return {
    defaultList: data.defaultList.list.map(toLxMusicInfo),
    loveList: data.loveList.list.map(toLxMusicInfo),
    userList: data.userList.map((list) => {
      const info: LxUserListInfo & { list: LxMusicInfo[] } = {
        id: list.id,
        name: list.name,
        locationUpdateTime: null,
        list: list.list.map(toLxMusicInfo),
      }
      if (list.type == 'online' || list.type == 'remote') info.source = list.meta.source
      return info
    }),
  }
}

const createBaseMeta = (): AnyListen.List.UserListInfoBaseMeta => ({
  songCount: 0,
  pic: '',
  playCount: 0,
  createTime: 0,
  updateTime: 0,
  posTime: 0,
  desc: '',
})

const createListInfo = (info: LxUserListInfo): AnyListen.List.UserListInfo => ({
  id: info.id,
  parentId: null,
  name: info.name,
  type: 'general',
  meta: createBaseMeta(),
})

/**
 * Apply a list action pushed by the sync server (i.e. a change made on another
 * device). The action payloads of LX Music and any-listen are identical, only
 * the music infos need to be converted.
 */
export const applyLxListAction = async (action: LxListAction): Promise<void> => {
  switch (action.action) {
    case 'list_data_overwrite':
      await writeLocalListData(fromLxListData(action.data))
      break
    case 'list_create':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_create',
        data: { position: action.data.position, listInfos: action.data.listInfos.map(createListInfo) },
      })
      break
    case 'list_remove':
      await extensionState.remoteFuncs.musicListAction({ action: 'list_remove', data: action.data })
      break
    case 'list_update':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_update',
        data: { lists: action.data.map(createListInfo), sync: true },
      })
      break
    case 'list_update_position':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_update_position',
        data: { ids: action.data.ids, position: action.data.position },
      })
      break
    case 'list_music_add':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_music_add',
        data: {
          id: action.data.id,
          musicInfos: action.data.musicInfos.map(fromLxMusicInfo),
          addMusicLocationType: action.data.addMusicLocationType,
        },
      })
      break
    case 'list_music_move':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_music_move',
        data: {
          fromId: action.data.fromId,
          toId: action.data.toId,
          musicInfos: action.data.musicInfos.map(fromLxMusicInfo),
          addMusicLocationType: action.data.addMusicLocationType,
        },
      })
      break
    case 'list_music_remove':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_music_remove',
        data: { listId: action.data.listId, ids: action.data.ids },
      })
      break
    case 'list_music_update':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_music_update',
        data: action.data.map((item) => ({ id: item.id, musicInfo: fromLxMusicInfo(item.musicInfo) })),
      })
      break
    case 'list_music_update_position':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_music_update_position',
        data: { listId: action.data.listId, position: action.data.position, ids: action.data.ids },
      })
      break
    case 'list_music_overwrite':
      await extensionState.remoteFuncs.musicListAction({
        action: 'list_music_overwrite',
        data: { listId: action.data.listId, musicInfos: action.data.musicInfos.map(fromLxMusicInfo) },
      })
      break
    case 'list_music_clear':
      await extensionState.remoteFuncs.musicListAction({ action: 'list_music_clear', data: action.data })
      break
  }
}

export const fromLxListData = (data: LxListData): AnyListen.List.ListDataFull => {
  return {
    defaultList: {
      id: LIST_IDS.DEFAULT,
      name: 'list__name_default',
      type: 'default',
      parentId: null,
      meta: createBaseMeta(),
      list: data.defaultList.map(fromLxMusicInfo),
    },
    loveList: {
      id: LIST_IDS.LOVE,
      name: 'list__name_love',
      type: 'default',
      parentId: null,
      meta: createBaseMeta(),
      list: data.loveList.map(fromLxMusicInfo),
    },
    userList: data.userList.map((list) => {
      const info: AnyListen.List.UserListInfoGeneralFull = {
        id: list.id,
        parentId: null,
        name: list.name,
        type: 'general',
        meta: { ...createBaseMeta(), songCount: list.list.length },
        list: list.list.map(fromLxMusicInfo),
      }
      return info
    }),
  }
}

const isSameIdList = (a: string[], b: string[]): boolean => a.length == b.length && a.every((id, i) => id == b[i])

const diffListMusics = (listId: string, prevList: LxMusicInfo[], nextList: LxMusicInfo[]): LxListAction[] => {
  const prevIds = new Set(prevList.map((m) => m.id))
  const nextIds = new Set(nextList.map((m) => m.id))
  const added = nextList.filter((m) => !prevIds.has(m.id))
  const removedIds = prevList.filter((m) => !nextIds.has(m.id)).map((m) => m.id)

  if (!added.length && !removedIds.length) {
    // Only the order changed, overwrite the list so the new order is applied
    if (
      !isSameIdList(
        prevList.map((m) => m.id),
        nextList.map((m) => m.id)
      )
    ) {
      return [{ action: 'list_music_overwrite', data: { listId, musicInfos: nextList } }]
    }
    return []
  }

  const actions: LxListAction[] = []
  if (added.length) {
    actions.push({
      action: 'list_music_add',
      data: { id: listId, musicInfos: added, addMusicLocationType: 'bottom' },
    })
  }
  if (removedIds.length) {
    actions.push({ action: 'list_music_remove', data: { listId, ids: removedIds } })
  }
  // The common part was reordered as well, fall back to an overwrite
  const commonPrev = prevList.filter((m) => nextIds.has(m.id)).map((m) => m.id)
  const commonNext = nextList.filter((m) => prevIds.has(m.id)).map((m) => m.id)
  if (!isSameIdList(commonPrev, commonNext)) {
    return [{ action: 'list_music_overwrite', data: { listId, musicInfos: nextList } }]
  }
  return actions
}

/**
 * Build the LX Music list actions that turn `prev` into `next`.
 * It is used to push local changes to the sync server.
 */
export const diffLxListData = (prev: LxListData, next: LxListData): LxListAction[] => {
  const actions: LxListAction[] = []

  const prevLists = new Map(prev.userList.map((list) => [list.id, list]))
  const nextLists = new Map(next.userList.map((list) => [list.id, list]))

  const created = next.userList
    .filter((list) => !prevLists.has(list.id))
    .map((list) => ({ id: list.id, name: list.name, locationUpdateTime: list.locationUpdateTime }))
  if (created.length) {
    actions.push({
      action: 'list_create',
      data: { position: next.userList.findIndex((list) => list.id == created[0].id), listInfos: created },
    })
  }

  const removed = prev.userList.filter((list) => !nextLists.has(list.id)).map((list) => list.id)
  if (removed.length) actions.push({ action: 'list_remove', data: removed })

  const updated = next.userList
    .filter((list) => {
      const prevList = prevLists.get(list.id)
      return prevList != undefined && prevList.name != list.name
    })
    .map((list) => ({ id: list.id, name: list.name, locationUpdateTime: list.locationUpdateTime }))
  if (updated.length) actions.push({ action: 'list_update', data: updated })

  actions.push(...diffListMusics(LIST_IDS.DEFAULT, prev.defaultList, next.defaultList))
  actions.push(...diffListMusics(LIST_IDS.LOVE, prev.loveList, next.loveList))
  for (const list of next.userList) {
    const prevList = prevLists.get(list.id)
    // A new list is created together with its musics, no need to diff them
    if (!prevList) continue
    actions.push(...diffListMusics(list.id, prevList.list, list.list))
  }

  return actions
}
