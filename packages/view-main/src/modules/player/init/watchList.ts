import { onRelease } from '@/modules/app/shared'
import { dislikeListEvent } from '@/modules/dislikeList/store/event'
import { dislikeListState } from '@/modules/dislikeList/store/state'
import { getListMusics } from '@/modules/musicLibrary/store/actions'
import { musicLibraryEvent } from '@/modules/musicLibrary/store/event'
import { onSettingChanged } from '@/modules/setting/shared'
import { arrPush, createUnsubscriptionSet, throttle } from '@/shared'
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
} from '../store/actions'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

const checkLinked = async () => {
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
const throttleListSync = throttle(async () => {
  const targetListId = playerState.playInfo.listId
  if (!targetListId) return
  const isSkip = !changedListIds.has(targetListId)
  changedListIds.clear()
  if (isSkip || !playerState.isLinkedList) return

  const newList = playerState.playList.filter((m) => m.playLater)
  const targetMusicList = await getListMusics(targetListId)
  const newTargetList = targetMusicList.map((m) => {
    return createPlayMusicInfo({
      musicInfo: m,
      listId: targetListId,
      isOnline: playerState.playInfo.isOnline,
      playLater: false,
      linked: true,
    })
  })
  arrPush(newList, newTargetList)
  // TODO music info update
  console.log('throttleListSync setPlayListMusic')
  await setPlayListMusic({ list: newList, listId: targetListId, isOnline: playerState.playInfo.isOnline, isSync: true })
}, 500)
const handleListSync = (listIds: string[]) => {
  for (const id of listIds) {
    changedListIds.add(id)
  }
  throttleListSync()
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
            } else {
              if (index != playerState.playInfo.index) updatePlayIndex(index)
            }

            checkLinkedAndApply()

            void updateDislikeIds()
          })
        )
      )

      unregistered.add(
        playerEvent.on('playHistoryListOverwrited', (list) => {
          if (playerState.playInfo.historyIndex < 0) return
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

      // TODO music info update
      unregistered.add(musicLibraryEvent.on('listMusicChanged', handleListSync))

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
