import { arrPush, arrPushByPosition, formatPlayTime2 } from '@any-listen/common/utils'

import { playerEvent } from './event'
import { playerState } from './state'

type PlayerMusicInfoKeys = keyof AnyListen.Player.MusicInfo
const musicInfoKeys: PlayerMusicInfoKeys[] = Object.keys(playerState.musicInfo) as PlayerMusicInfoKeys[]

export const setIsLinkedList = (isLinked: boolean) => {
  playerState.isLinkedList = isLinked
}

export const setPlayInfo = (index: number, listId: string) => {
  playerState.playInfo.index = index
  playerState.playInfo.listId = listId

  playerEvent.playInfoChanged({ index, listId })
}

export const updatePlayIndex = (index: number, historyIndex?: number, lastTrackId?: string | null) => {
  playerState.playInfo.index = index
  let changedInfo: Partial<AnyListen.Player.PlayInfo> = { index }
  if (historyIndex != null) {
    playerState.playInfo.historyIndex = historyIndex
    changedInfo.historyIndex = historyIndex
  }
  if (lastTrackId !== undefined) {
    playerState.playInfo.lastTrackId = lastTrackId
    changedInfo.lastTrackId = lastTrackId
  }

  playerEvent.playInfoChanged(changedInfo)
}

export const updatePlayHistoryIndex = (historyIndex: number) => {
  playerState.playInfo.historyIndex = historyIndex

  playerEvent.playInfoChanged({ historyIndex })
}

export const setPlayListId = (listId: string | null, isOnline: boolean) => {
  playerState.playInfo.listId = listId
  playerState.playInfo.isOnline = isOnline

  playerEvent.playInfoChanged({ listId, isOnline })
}

export const setPlayMusicInfo = (info: AnyListen.Player.PlayMusicInfo | null) => {
  playerState.playMusicInfo = info

  playerEvent.playMusicInfoChanged(info ? { ...info } : null)
}

export const setPlayerTitle = (title: string | null) => {
  playerState.title = title

  playerEvent.titleChanged(title)
}

export const setMusicInfo = (_musicInfo: Partial<AnyListen.Player.MusicInfo> | null) => {
  _musicInfo ||= {
    id: null,
    pic: null,
    lrc: null,
    tlrc: null,
    rlrc: null,
    awlrc: null,
    rawlrc: null,
    name: '',
    singer: '',
    album: '',
    collect: false,
  }
  let changedInfo: Partial<AnyListen.Player.MusicInfo> = {}
  for (const key of musicInfoKeys) {
    const val = _musicInfo[key]
    if (val !== undefined) {
      // @ts-expect-error
      playerState.musicInfo[key] = val
      // @ts-expect-error
      changedInfo[key] = val
    }
  }

  if (Object.keys(changedInfo).length == 0) return
  playerEvent.musicInfoChanged(changedInfo)
}

export const setPlaying = (playing: boolean) => {
  if (playerState.playing == playing) return
  playerState.playing = playing
  playerState.isPlayedStop &&= false

  playerEvent.playStatusChanged(playing)
}

export const setPlayerPlaying = (playerPlaying: boolean) => {
  playerState.playerPlaying = playerPlaying

  playerEvent.playerPlayStatusChanged(playerPlaying)
}

export const setStatusText = (statusText: string) => {
  playerState.statusText = statusText
  playerEvent.statusTextChanged(statusText)
}

export const setNowPlayTime = (time: number) => {
  const oldProgress = { ...playerState.progress }
  playerState.progress.nowPlayTime = time
  playerState.progress.nowPlayTimeStr = formatPlayTime2(time)
  playerState.progress.progress = playerState.progress.maxPlayTime ? time / playerState.progress.maxPlayTime : 0

  playerEvent.progressChanged({ ...playerState.progress }, oldProgress)
}
export const setMaxPlayTime = (time: number) => {
  playerState.playInfo.duration = time

  playerEvent.playInfoChanged({ duration: time })

  playerState.progress.maxPlayTime = time
  playerState.progress.maxPlayTimeStr = formatPlayTime2(time)
  playerState.progress.progress = time ? playerState.progress.nowPlayTime / time : 0

  playerEvent.durationChanged({ ...playerState.progress })
}
// export const setMaxPlayTimeManually = (time: number) => {
//   playerState.playInfo.duration = time

//   playerState.progress.maxPlayTime = time
//   playerState.progress.maxPlayTimeStr = formatPlayTime2(time)
//   playerState.progress.progress = time ? playerState.progress.nowPlayTime / time : 0

//   playerEvent.durationChanged({ ...playerState.progress })
// }
export const setProgress = (currentTime: number, totalTime: number) => {
  const oldProgress = { ...playerState.progress }

  playerState.playInfo.duration = totalTime

  playerEvent.playInfoChanged({ duration: totalTime })

  playerState.progress.nowPlayTime = currentTime
  playerState.progress.nowPlayTimeStr = formatPlayTime2(currentTime)
  playerState.progress.maxPlayTime = totalTime
  playerState.progress.maxPlayTimeStr = formatPlayTime2(totalTime)
  playerState.progress.progress = totalTime ? playerState.progress.nowPlayTime / currentTime : 0

  playerEvent.durationChanged({ ...playerState.progress })
  playerEvent.progressChanged({ ...playerState.progress }, oldProgress)
}

export const setPlayListMusic = (list: AnyListen.Player.PlayMusicInfo[]) => {
  playerState.playList = list

  const l = [...playerState.playList]
  playerEvent.playListMusicOverwrited(list)
  playerEvent.playListMusicChanged(l)
  playerEvent.playListChanged(l)
}

export const addPlayListMusic = (position: number, list: AnyListen.Player.PlayMusicInfo[]) => {
  if (position < 0 || position >= playerState.playList.length) {
    playerState.playList = arrPush(playerState.playList, list)
  } else {
    arrPushByPosition(playerState.playList, list, position)
  }

  const l = [...playerState.playList]
  playerEvent.playListMusicAdded(position, list)
  playerEvent.playListMusicChanged(l)
  playerEvent.playListChanged(l)
}

export const removePlayListMusic = (ids: string[]) => {
  playerState.playList = playerState.playList.filter((l) => !ids.includes(l.itemId))

  const l = [...playerState.playList]
  playerEvent.playListMusicRemoved(ids)
  playerEvent.playListMusicChanged(l)
  playerEvent.playListChanged(l)
}

export const updatePlayListMusic = (info: AnyListen.Player.PlayMusicInfo[]) => {
  const musicMap = new Map<string, AnyListen.Player.PlayMusicInfo>()
  for (const music of info) musicMap.set(music.itemId, music)

  playerState.playList.forEach((oInfo, index, list) => {
    const info = musicMap.get(oInfo.itemId)
    if (!info) return
    oInfo.musicInfo.name = info.musicInfo.name
    oInfo.musicInfo.singer = info.musicInfo.singer
    oInfo.musicInfo.isLocal = info.musicInfo.isLocal
    oInfo.musicInfo.interval = info.musicInfo.interval
    oInfo.musicInfo.meta = info.musicInfo.meta
    oInfo.musicInfo = { ...oInfo.musicInfo }
    list.splice(index, 1, { ...oInfo })
  })

  playerEvent.playListChanged([...playerState.playList])
}

export const updatePlayListMusicPlayed = (played: boolean, ids: string[]) => {
  const idsMap = new Map<string, number>()
  playerState.playList.forEach((info, index) => idsMap.set(info.itemId, index))
  for (const id of ids) {
    const index = idsMap.get(id)
    if (index == null) continue
    playerState.playList.splice(index, 1, { ...playerState.playList[index], played })
  }

  playerEvent.playListChanged([...playerState.playList])
}

export const updatePlayListMusicPlayedAll = (played: boolean) => {
  playerState.playList = playerState.playList.map((info) => {
    return { ...info, played }
  })

  playerEvent.playListChanged(playerState.playList)
}

export const updatePlayListMusicPosition = (position: number, ids: string[]) => {
  const newList = [...playerState.playList]

  const updateInfos: AnyListen.Player.PlayMusicInfo[] = []

  for (let i = newList.length - 1; i >= 0; i--) {
    if (ids.includes(newList[i].itemId)) {
      const list = newList.splice(i, 1)[0]
      updateInfos.push(list)
    }
  }
  position = Math.min(newList.length, position)

  arrPushByPosition(newList, updateInfos, position)
  playerState.playList = newList

  playerEvent.playListMusicChanged(playerState.playList)
  playerEvent.playListChanged(playerState.playList)
}

export const setPlayedStop = (isPlayedStop: boolean) => {
  playerState.isPlayedStop = isPlayedStop
}

export const setDislikeIds = (ids: Set<string>) => {
  playerState.dislikeIds = ids
}

export const setLoadErrorPicUrl = (url: string) => {
  playerState.loadErrorPicUrl = url
}

export const setPlayHistoryList = (list: AnyListen.IPCPlayer.PlayHistoryListItem[]) => {
  playerState.playHistoryList = list
  playerEvent.playHistoryListOverwrited(list)
  playerEvent.playHistoryListChanged(list)
}
export const addPlayHistoryList = (ids: AnyListen.IPCPlayer.PlayHistoryListItem[]) => {
  playerState.playHistoryList = arrPush([...playerState.playHistoryList], ids)
  playerEvent.playHistoryListAdded(ids)
  playerEvent.playHistoryListChanged(playerState.playHistoryList)
}
export const removePlayHistoryList = (idxs: number[]) => {
  idxs.sort((a, b) => b - a)
  const newList = [...playerState.playHistoryList]
  for (const idx of idxs) newList.splice(idx, 1)
  playerEvent.playHistoryListRemoved(idxs)
  playerEvent.playHistoryListChanged(newList)
}

export const setVolume = (volume: number) => {
  playerState.volume = volume
  playerEvent.volumeChanged(volume)
}
export const setVolumeMute = (mute: boolean) => {
  playerState.volumeMute = mute
  playerEvent.volumeMuteChanged(mute)
}

export const setPlaybackRate = (rate: number) => {
  playerState.playbackRate = rate
  playerEvent.playbackRateUpdated(rate)
}
