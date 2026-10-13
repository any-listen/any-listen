import { createPlayMusicInfo } from '@any-listen/common/tools'

import { onRelease } from '@/modules/app/shared'
import { hasDislike } from '@/modules/dislikeList/store/actions'
import { dislikeListEvent } from '@/modules/dislikeList/store/event'
import { dislikeListState } from '@/modules/dislikeList/store/state'
import { extensionEvent } from '@/modules/extension/store/event'
import { getListMusics } from '@/modules/musicLibrary/store/actions'
import { musicLibraryEvent } from '@/modules/musicLibrary/store/event'
import { onSettingChanged } from '@/modules/setting/shared'
import { arrPush, createUnsubscriptionSet, generateId, throttle } from '@/shared'
import { workers } from '@/worker'

import { onPlayerCreated } from '../shared'
import {
  setDislikeIds,
  setIsLinkedList,
  setPlayListMusic,
  skipNext,
  updatePlayHistoryIndex,
  updatePlayIndex,
  updatePlayListMusic,
} from '../store/actions'
import { playerEvent } from '../store/event'
import { loadImageUrl, loadMusicLyric } from '../store/playerActions'
import { playerState } from '../store/state'

let syncId = ''
const checkListSync = async () => {
  if (syncId || playerState.playInfo.source != 'local') return playerState.playInfo.isLinkedList
  const currentMusicList = playerState.playList.filter((m) => !m.playLater)
  const targetMusicList = await getListMusics(playerState.playInfo.listId)
  if (currentMusicList.length !== targetMusicList.length) return false
  for (let i = 0; i < currentMusicList.length; i++) {
    if (currentMusicList[i].musicInfo.id != targetMusicList[i].id) return false
  }
  return true
}
const checkLinkedAndSync = async () => {
  const isSynced = await checkListSync()
  if (isSynced) return
  console.log('list is not synced, try to sync')
  if (playerState.playInfo.listId) handleListChangeSync([playerState.playInfo.listId])
}
const checkLinkedAndApply = () => {
  if (!playerState.inited || syncId) return
  void checkListSync().then((isSynced) => {
    if (syncId) return
    // console.log('isSynced', isSynced)
    if (!isSynced) console.warn('list is not linked: ', isSynced)
    setIsLinkedList(isSynced)
  })
}
const changedListIds = new Set<string | null>()
const throttleListChangeSync = throttle(async () => {
  if (!playerState.inited) return
  const targetListId = playerState.playInfo.listId
  if (!targetListId || playerState.playInfo.source != 'local') {
    syncId = ''
    return
  }
  const isSkip = !changedListIds.has(targetListId)
  changedListIds.clear()
  if (isSkip || !playerState.playInfo.isLinkedList) {
    syncId = ''
    return
  }

  const musicMap = new Map<string, AnyListen.Player.PlayMusicInfo>()
  const newList = playerState.playList.filter((m) => {
    if (!m.playLater) musicMap.set(m.itemId, m)
    return m.playLater
  })
  const curSyncId = syncId
  const targetMusicList = await getListMusics(targetListId)
  if (curSyncId != syncId) return
  const newTargetList = targetMusicList.map((m) => {
    const newInfo = createPlayMusicInfo({
      musicInfo: m,
      listId: targetListId,
      source: playerState.playInfo.source,
      playLater: false,
      linked: true,
    })
    const info = musicMap.get(newInfo.itemId)
    if (info) newInfo.played = info.played
    return newInfo
  })
  arrPush(newList, newTargetList)
  // TODO diff update
  console.log('throttleListSync setPlayListMusic')
  await setPlayListMusic({ list: newList, listId: targetListId, source: playerState.playInfo.source, isSync: true })
  if (curSyncId == syncId) syncId = ''
}, 500)
const handleListChangeSync = (listIds: string[]) => {
  for (const id of listIds) {
    changedListIds.add(id)
  }
  syncId = generateId()
  throttleListChangeSync()
}

const buildMusicInfoMapId = (
  musicInfo: AnyListen.Music.MusicInfo,
  listId: string | null,
  source: AnyListen.Player.SourceType | null
) => {
  return `${listId}.${source}.${musicInfo.id}`
}
const updatedMusicInfos = new Map<
  string,
  { musicInfo: AnyListen.Music.MusicInfo; listId: string | null; source: AnyListen.Player.SourceType | null }
>()
const updatedMusicPics = new Map<
  string,
  { musicInfo: AnyListen.Music.MusicInfo; listId: string | null; source: AnyListen.Player.SourceType | null }
>()
const throttleListMusicUpdateSync = throttle(async () => {
  const updatedInfos: AnyListen.Player.PlayMusicInfo[] = []
  for (const m of playerState.playList) {
    const id = buildMusicInfoMapId(m.musicInfo, m.listId, m.source)
    const targetInfo = updatedMusicInfos.get(id)
    if (targetInfo) {
      updatedInfos.push({
        ...m,
        musicInfo: targetInfo.musicInfo,
      })
      continue
    }

    const targetPic = updatedMusicPics.get(id)
    if (targetPic && (m.musicInfo.meta.picUrl != targetPic.musicInfo.meta.picUrl || m.musicInfo === targetPic.musicInfo)) {
      m.musicInfo.meta.picUrl = targetPic.musicInfo.meta.picUrl
      updatedInfos.push(m)
    }
  }
  updatedMusicInfos.clear()
  updatedMusicPics.clear()
  if (!updatedInfos.length) return
  console.log('throttleListSync updatePlayListMusic')
  await updatePlayListMusic(updatedInfos)
}, 500)
const handleListInfoUpdateSync = (updateInfo: Map<string, AnyListen.Music.MusicInfo[]>) => {
  const targetListId = playerState.playInfo.listId
  if (!targetListId) return
  console.log('handleListInfoUpdateSync')
  for (const [listId, musics] of updateInfo.entries()) {
    for (const m of musics) {
      updatedMusicInfos.set(buildMusicInfoMapId(m, listId, playerState.playInfo.source), {
        musicInfo: m,
        listId,
        source: playerState.playInfo.source,
      })
    }
  }
  throttleListMusicUpdateSync()
}
const handleMusicPicUpdateSync = (
  musicInfo: AnyListen.Music.MusicInfo,
  listId: string | null = null,
  source: AnyListen.Player.SourceType | null = null
) => {
  updatedMusicPics.set(buildMusicInfoMapId(musicInfo, listId, source), {
    musicInfo,
    listId,
    source,
  })
  throttleListMusicUpdateSync()
}

const updateDislikeIds = async () => {
  setDislikeIds(
    await workers.main.getDislikeIds(playerState.playList, {
      names: dislikeListState.names,
      musicNames: dislikeListState.musicNames,
      singerNames: dislikeListState.singerNames,
    })
  )

  if (playerState.playMusicInfo && hasDislike(playerState.playMusicInfo.musicInfo)) {
    void skipNext()
  }
}

let unregistered = createUnsubscriptionSet()
export const initWatchList = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        playerEvent.on(
          'playListMusicChanged',
          throttle(() => {
            let index: number
            if (playerState.playMusicInfo) {
              const id = playerState.playMusicInfo.itemId
              const mid = playerState.playMusicInfo.musicInfo.id
              if (playerState.playMusicInfo.playLater) {
                index = playerState.playList.findIndex((item) => item.itemId == id)
              } else {
                index = playerState.playList.findIndex(
                  (item) => item.itemId == id || (!item.playLater && item.musicInfo.id == mid)
                )
              }
            } else index = -1

            if (index < 0 && playerState.playMusicInfo) {
              // 歌曲被移除
              console.log('current music removed')
              void skipNext(true)
            } else if (index != playerState.playInfo.index) updatePlayIndex(index)

            checkLinkedAndApply()

            void updateDislikeIds()
          })
        )
      )

      unregistered.add(
        playerEvent.on('playHistoryListOverwrited', (list) => {
          if (playerState.playInfo.historyIndex < 0) return
          if (list.length && list[playerState.playInfo.historyIndex]?.id == playerState.playMusicInfo?.itemId) {
            return
          }
          updatePlayHistoryIndex(-1)
        })
      )
      unregistered.add(
        playerEvent.on('playHistoryListRemoved', (idxs) => {
          if (playerState.playInfo.historyIndex < 0) return
          let curIdx = playerState.playInfo.historyIndex
          for (const idx of idxs) {
            if (idx > curIdx) continue
            curIdx--
          }
          if (playerState.playInfo.historyIndex == curIdx) return
          updatePlayHistoryIndex(curIdx)
        })
      )

      unregistered.add(playerEvent.on('listMusicPicUpdated', handleMusicPicUpdateSync))
      unregistered.add(
        extensionEvent.on('resourceListUpdated', (list) => {
          if (!playerState.playMusicInfo) return
          if (!playerState.musicInfo.pic && (list.resources.musicPic?.length || list.resources.musicPicSearch?.length)) {
            void loadImageUrl(playerState.playMusicInfo)
          }
          if (!playerState.musicInfo.lrc && (list.resources.musicLyric?.length || list.resources.lyricSearch?.length)) {
            void loadMusicLyric(playerState.playMusicInfo)
          }
        })
      )

      unregistered.add(musicLibraryEvent.on('listMusicChanged', handleListChangeSync))
      unregistered.add(musicLibraryEvent.on('listMusicUpdated', handleListInfoUpdateSync))
      unregistered.add(
        musicLibraryEvent.on('listMusicRemovedBefore', (listId, musicIds) => {
          if (!playerState.playMusicInfo) return
          const targetListId = playerState.playMusicInfo.listId
          if (listId != targetListId || !musicIds.includes(playerState.playMusicInfo.musicInfo.id)) return
          console.log('current music removed by listMusicRemovedBefore')
          void skipNext(true)
        })
      )

      unregistered.add(
        onSettingChanged('player.togglePlayMethod', (val) => {
          // if (playerState.playList.some(m => m.played)) {
          //   void setPlayListMusicUnplayedAll()
          // }
          // if (playerState.playHistoryList.length) {
          //   void setPlayHistoryList([])
          // }
          if (playerState.playInfo.historyIndex >= 0) updatePlayHistoryIndex(-1)
        })
      )

      unregistered.add(dislikeListEvent.on('updated', updateDislikeIds))

      unregistered.add(
        playerEvent.on('inited', (inited) => {
          if (!inited) return
          void checkLinkedAndSync()
        })
      )
    })
  })
}
