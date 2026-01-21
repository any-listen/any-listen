import { onRelease } from '@/modules/app/shared'
import { dislikeListEvent } from '@/modules/dislikeList/store/event'
import { dislikeListState } from '@/modules/dislikeList/store/state'
import { getListMusics } from '@/modules/musicLibrary/store/actions'
import { musicLibraryEvent } from '@/modules/musicLibrary/store/event'
import { onSettingChanged } from '@/modules/setting/shared'
import { arrPush, createUnsubscriptionSet, generateId, throttle } from '@/shared'
import { workers } from '@/worker'
import { createPlayMusicInfo } from '@any-listen/common/tools'
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
import { playerState } from '../store/state'

let syncId = ''
const checkLinked = async () => {
  if (syncId) return playerState.isLinkedList
  const currentMusicList = playerState.playList.filter((m) => !m.playLater)
  const targetMusicList = await getListMusics(playerState.playInfo.listId)
  if (currentMusicList.length !== targetMusicList.length) return false
  for (let i = 0; i < currentMusicList.length; i++) {
    if (currentMusicList[i].musicInfo.id != targetMusicList[i].id) return false
  }
  return true
}
const checkLinkedAndApply = () => {
  void checkLinked().then((isLinked) => {
    setIsLinkedList(isLinked)
  })
}
const changedListIds = new Set<string | null>()
const throttleListChangeSync = throttle(async () => {
  const targetListId = playerState.playInfo.listId
  if (!targetListId) {
    syncId = ''
    return
  }
  const isSkip = !changedListIds.has(targetListId)
  changedListIds.clear()
  if (isSkip || !playerState.isLinkedList) {
    syncId = ''
    return
  }

  const musicMap = new Map<string, AnyListen.Player.PlayMusicInfo>()
  const newList = playerState.playList.filter((m) => {
    musicMap.set(m.itemId, m)
    return m.playLater
  })
  const curSyncId = syncId
  const targetMusicList = await getListMusics(targetListId)
  const newTargetList = targetMusicList.map((m) => {
    const newInfo = createPlayMusicInfo({
      musicInfo: m,
      listId: targetListId,
      isOnline: playerState.playInfo.isOnline,
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
  await setPlayListMusic({ list: newList, listId: targetListId, isOnline: playerState.playInfo.isOnline, isSync: true })
  if (curSyncId == syncId) syncId = ''
}, 500)
const handleListChangeSync = (listIds: string[]) => {
  for (const id of listIds) {
    changedListIds.add(id)
  }
  syncId = generateId()
  throttleListChangeSync()
}

let prelistId: string | null = null
const updatedMusicInfos = new Set<AnyListen.Music.MusicInfo>()
const throttleListMusicUpdateSync = throttle(async () => {
  const targetListId = playerState.playInfo.listId
  if (prelistId != targetListId) {
    prelistId = targetListId
    updatedMusicInfos.clear()
    return
  }
  if (!targetListId) {
    updatedMusicInfos.clear()
    return
  }

  const musicMap = new Map<string, AnyListen.Music.MusicInfo>()
  for (const m of updatedMusicInfos) musicMap.set(m.id, m)
  updatedMusicInfos.clear()
  const updatedInfos: AnyListen.Player.PlayMusicInfo[] = []
  for (const m of playerState.playList) {
    if (!musicMap.has(m.musicInfo.id)) continue
    const target = musicMap.get(m.musicInfo.id)!
    updatedInfos.push({
      ...m,
      musicInfo: target,
    })
  }
  if (!updatedInfos.length) return
  console.log('throttleListSync updatePlayListMusic')
  await updatePlayListMusic(updatedInfos)
}, 500)
const handleListInfoUpdateSync = (updateInfo: Map<string, AnyListen.Music.MusicInfo[]>) => {
  const targetListId = playerState.playInfo.listId
  if (!targetListId) return
  const musics = updateInfo.get(targetListId)
  if (prelistId != playerState.playInfo.listId) {
    prelistId = playerState.playInfo.listId
    updatedMusicInfos.clear()
  }
  if (!musics) return

  for (const m of musics) updatedMusicInfos.add(m)
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

      checkLinkedAndApply()
    })
  })
}
