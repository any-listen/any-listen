/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// import { checkMusicFileAvailable } from '@renderer/utils/music'

import { addInfo } from '@/modules/dislikeList/actions'
import { addListMusics, parseMusicMetadata, removeListMusics, updateListMusic } from '@/modules/musicLibrary/store/actions'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { getSrc, isEmpty, releasePlayer, setPause, setPlay, setResource, setStop } from '@/plugins/player'
import { parseInterval } from '@/shared'
import { LIST_IDS } from '@any-listen/common/constants'
import { createPlayMusicInfoList } from '@any-listen/common/tools'
import { getRandom } from '@any-listen/common/utils'
import { checkPicUrl } from '@any-listen/web'
import * as commit from './commit'
import { playerEvent } from './event'
import { setPlayListMusic, setPlayListMusicPlayed, setPlayListMusicUnplayedAll } from './listRemoteAction'
import { addPlayHistoryList, getMusicLyric, getMusicPic, getMusicUrl, setPlayHistoryList } from './playerRemoteAction'
import { playerState } from './state'

let gettingUrlId = ''
const createDelayNextTimeout = (delay: number) => {
  let timeout: number | null
  const clearDelayNextTimeout = () => {
    // console.log(this.timeout)
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const addDelayNextTimeout = () => {
    clearDelayNextTimeout()
    timeout = setTimeout(() => {
      timeout = null
      if (!playerState.playing) return
      console.warn('delay next timeout timeout', delay)
      void skipNext(true)
    }, delay)
  }

  return {
    clearDelayNextTimeout,
    addDelayNextTimeout,
  }
}
const { addDelayNextTimeout, clearDelayNextTimeout } = createDelayNextTimeout(5000)
const { addDelayNextTimeout: addLoadTimeout, clearDelayNextTimeout: clearLoadTimeout } = createDelayNextTimeout(100000)

/**
 * 检查音乐信息是否已更改
 */
const diffCurrentMusicInfo = (curMusicInfo: AnyListen.Music.MusicInfo): boolean => {
  // return curMusicInfo !== playMusicInfo.musicInfo || isPlay.value
  return (
    gettingUrlId != curMusicInfo.id ||
    curMusicInfo.id != playerState.playMusicInfo?.musicInfo.id ||
    (!!getSrc() && playerState.playerPlaying)
  )
}

// let cancelDelayRetry: (() => void) | null = null
// const delayRetry = async (musicInfo: AnyListen.Music.MusicInfo, isRefresh = false): Promise<string | null> => {
//   // if (cancelDelayRetry) cancelDelayRetry()
//   return new Promise<string | null>((resolve, reject) => {
//     const time = getRandom(2, 6)
//     commit.setStatusText(i18n.t('player__geting_url_delay_retry', { time }))
//     const tiemout = setTimeout(() => {
//       getMusicPlayUrl(musicInfo, isRefresh, true)
//         .then((result) => {
//           cancelDelayRetry = null
//           resolve(result)
//         })
//         .catch(async (err: Error) => {
//           cancelDelayRetry = null
//           reject(err)
//         })
//     }, time * 1000)
//     cancelDelayRetry = () => {
//       clearTimeout(tiemout)
//       cancelDelayRetry = null
//       resolve(null)
//     }
//   })
// }
const getMusicPlayUrl = async (
  musicInfo: AnyListen.Music.MusicInfo,
  isRefresh = false,
  isRetryed = false
): Promise<string | null> => {
  // this.musicInfo.url = await getMusicPlayUrl(targetSong, type)
  commit.setStatusText(i18n.t('player__geting_url'))
  if (settingState.setting['player.autoSkipOnError']) addLoadTimeout()

  // const type = getPlayType(settingState.setting['player.playQuality'], musicInfo)

  return getMusicUrl({ musicInfo, isRefresh })
    .then(({ url }) => {
      console.log('url', url)
      if (diffCurrentMusicInfo(musicInfo)) return null
      // console.log(url)
      return url
    })
    .catch(async (err: Error) => {
      // console.log('err', err.message)
      if (!playerState.playing || diffCurrentMusicInfo(musicInfo)) {
        return null
      }

      // if (err.message == requestMsg.tooManyRequests) return delayRetry(musicInfo, isRefresh)

      if (!isRetryed) return getMusicPlayUrl(musicInfo, isRefresh, true)

      throw err
    })
}

export const setMusicUrl = (musicInfo: AnyListen.Music.MusicInfo, isRefresh?: boolean) => {
  // if (settingState.setting['player.autoSkipOnError']) addLoadTimeout()
  if (!playerState.playing || !diffCurrentMusicInfo(musicInfo)) return
  // if (cancelDelayRetry) cancelDelayRetry()
  gettingUrlId = musicInfo.id
  void getMusicPlayUrl(musicInfo, isRefresh)
    .then((url) => {
      if (!url) return
      setResource(url)
    })
    .catch((err: Error) => {
      console.log(err)
      commit.setStatusText(err.message)
      playerEvent.error()
      if (settingState.setting['player.autoSkipOnError']) addDelayNextTimeout()
    })
    .finally(() => {
      if (musicInfo.id === playerState.playMusicInfo?.musicInfo.id) {
        gettingUrlId = ''
        clearLoadTimeout()
      }
    })
}

const parsePlayList = () => {
  const playLaterList: AnyListen.Player.PlayMusicInfo[] = []
  const playList: AnyListen.Player.PlayMusicInfo[] = []
  const curId = playerState.playMusicInfo?.itemId
  for (const m of playerState.playList) {
    if (m.playLater) playLaterList.push(m)
    else if (!playerState.dislikeIds.has(m.itemId) || curId == m.itemId) {
      playList.push(m)
    }
  }
  return [playLaterList, playList] as const
}
const buildPlayerMusicInfo = (musicInfo: AnyListen.Music.MusicInfo | AnyListen.Download.ListItem | null) => {
  if (musicInfo) {
    return 'progress' in musicInfo
      ? {
          id: musicInfo.id,
          pic: musicInfo.metadata.musicInfo.meta.picUrl,
          name: musicInfo.metadata.musicInfo.name,
          singer: musicInfo.metadata.musicInfo.singer,
          album: musicInfo.metadata.musicInfo.meta.albumName ?? '',
          lrc: null,
          tlrc: null,
          rlrc: null,
          awlrc: null,
          rawlrc: null,
        }
      : {
          id: musicInfo.id,
          pic: musicInfo.meta.picUrl,
          name: musicInfo.name,
          singer: musicInfo.singer,
          album: musicInfo.meta.albumName ?? '',
          lrc: null,
          tlrc: null,
          rlrc: null,
          awlrc: null,
          rawlrc: null,
        }
  }
  return {
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
  }
}
const loadImageUrl = async (info: AnyListen.Player.PlayMusicInfo, refresh?: boolean) => {
  return getMusicPic({ musicInfo: info.musicInfo, listId: info.listId, isRefresh: refresh })
    .then(({ url }) => {
      if (info.musicInfo.id != playerState.playMusicInfo?.musicInfo.id) return
      commit.setMusicInfo({ pic: url })
      playerEvent.picUpdated(url)
      return url
    })
    .catch(() => {
      if (info.musicInfo.id != playerState.playMusicInfo?.musicInfo.id) return
      commit.setMusicInfo({ pic: null })
      playerEvent.picUpdated(null)
    })
}
const setMetadata = async (info: AnyListen.Player.PlayMusicInfo) => {
  if (info.musicInfo.meta.unparsed) {
    const newInfo = await parseMusicMetadata(info.listId, info.musicInfo)
    // console.log(newInfo)
    if (newInfo) {
      info.musicInfo = newInfo
      commit.setMusicInfo(buildPlayerMusicInfo(info.musicInfo))
      void updateListMusic(info.listId, newInfo)
    }
  }
  void loadImageUrl(info).then((url) => {
    if (!url) return
    void checkPicUrl(url).catch(() => {
      if (info.musicInfo.id != playerState.playMusicInfo?.musicInfo.id) return
      void loadImageUrl(info, true)
    })
  })

  void getMusicLyric({ musicInfo: info.musicInfo })
    .then((lyricInfo) => {
      if (info.musicInfo.id != playerState.playMusicInfo?.musicInfo.id) return
      commit.setMusicInfo({
        lrc: lyricInfo.info.lyric,
        tlrc: lyricInfo.info.tlyric,
        awlrc: lyricInfo.info.awlyric,
        rlrc: lyricInfo.info.rlyric,
      })
      playerEvent.lyricUpdated(lyricInfo.info)
    })
    .catch((err) => {
      console.log(err)
      if (info.musicInfo.id != playerState.playMusicInfo?.musicInfo.id) return
      commit.setStatusText(i18n.t('lyric__load_error'))
    })
}
export const setPlayMusicInfo = (info: AnyListen.Player.PlayMusicInfo | null, index?: number | null, historyListIndex = -1) => {
  const oldInfo = playerState.playMusicInfo
  const oldHistoryIdx = playerState.playInfo.historyIndex
  if (info) {
    commit.setPlayMusicInfo(info)
    commit.setMusicInfo(buildPlayerMusicInfo(info.musicInfo))
    void setMetadata(info)
    playerEvent.setProgress(0, parseInterval(info.musicInfo.interval))
    const idx = index == null ? playerState.playList.findIndex((m) => m.itemId == info.itemId) : index
    historyListIndex =
      historyListIndex >= 0 && info.itemId == playerState.playHistoryList[historyListIndex]?.id ? historyListIndex : -1
    commit.updatePlayIndex(idx, historyListIndex)
    playerEvent.musicChanged(idx, historyListIndex)
  } else {
    commit.setPlayMusicInfo(null)
    commit.setMusicInfo(null)
    commit.updatePlayIndex(-1, -1)
  }
  if (oldInfo) {
    if (!oldInfo.playLater && settingState.setting['player.togglePlayMethod'] == 'random') {
      if (!oldInfo.played) void setPlayListMusicPlayed([oldInfo.itemId])
      if (
        oldInfo.listId == playerState.playInfo?.listId &&
        oldHistoryIdx < 0 &&
        playerState.playHistoryList.at(-1)?.id != oldInfo.itemId
      ) {
        void addPlayHistoryList([{ id: oldInfo.itemId, time: Date.now() }])
      }
    }
  }
}

// 处理音乐播放
const handlePlay = () => {
  resetRandomNextMusicInfo()
  const playMusicInfo = playerState.playMusicInfo

  if (!playMusicInfo) return

  setStop()
  // playerEvent.pause()

  clearDelayNextTimeout()
  clearLoadTimeout()

  setMusicUrl(playMusicInfo.musicInfo)
}

const handlePlayList = async (
  listId: string,
  isOnline: boolean,
  targetList: AnyListen.Music.MusicInfo[],
  index: number,
  isClianHistory = false
) => {
  const prevListId = playerState.playInfo.listId
  setPause()
  const targetMusicInfo = targetList[index]
  let targetPlayMusicInfo: AnyListen.Player.PlayMusicInfo | undefined
  if (prevListId == listId) {
    if (playerState.isLinkedList) {
      targetPlayMusicInfo = playerState.playList.find((m) => !m.playLater && m.musicInfo.id == targetMusicInfo.id)
      setPlayMusicInfo(targetPlayMusicInfo!, index)
    }
  } else {
    commit.setPlayListId(listId, isOnline)
  }
  if (targetPlayMusicInfo == null) {
    const newList = createPlayMusicInfoList({
      musicInfos: targetList,
      listId,
      isOnline,
      playLater: false,
    })
    await setPlayListMusic({ list: newList, listId, isOnline })
    targetPlayMusicInfo = newList.find((m) => m.musicInfo.id == targetMusicInfo.id)
    setPlayMusicInfo(targetPlayMusicInfo!, index)
  }
  commit.setPlaying(true)
  handlePlay()
  if (settingState.setting['player.isAutoCleanPlayedList'] || prevListId != listId || isClianHistory) {
    await Promise.all([setPlayListMusicUnplayedAll(), setPlayHistoryList([])])
  }
}
/**
 * 播放列表内歌曲
 * @param listId 列表id
 * @param index 播放的歌曲位置
 */
export const playList = async (
  listId: string,
  targetList: AnyListen.Music.MusicInfo[],
  index: number,
  isClianHistory = false
) => {
  return handlePlayList(listId, false, targetList, index, isClianHistory)
}
/**
 * 播放在线列表内歌曲
 * @param listId 列表id
 * @param index 播放的歌曲位置
 */
export const playOnlineList = async (
  listId: string,
  targetList: AnyListen.Music.MusicInfo[],
  index: number,
  isClianHistory = false
) => {
  return handlePlayList(listId, true, targetList, index, isClianHistory)
}

const handleToggleStop = () => {
  stop()
  setPlayMusicInfo(null)
}

export const playIndex = (index: number, historyListIndex = -1) => {
  commit.setPlaying(true)
  handlePlayMusicInfo(playerState.playList[index], historyListIndex)
}
export const playId = (id: string, historyListIndex = -1) => {
  const target = playerState.playList.find((m) => m.itemId == id)
  if (!target) return
  commit.setPlaying(true)
  handlePlayMusicInfo(target, historyListIndex)
}

const randomNextMusicInfo = {
  info: null as AnyListen.Player.PlayMusicInfo | null,
  historyListIndex: -1,
  isEnd: false,
}
export const resetRandomNextMusicInfo = () => {
  if (randomNextMusicInfo.info) {
    randomNextMusicInfo.info = null
    randomNextMusicInfo.historyListIndex = -1
    randomNextMusicInfo.isEnd = false
  }
}

export const getNextPlayMusicInfo = async (): Promise<AnyListen.Player.PlayMusicInfo | null> => {
  const [playLaterList, playList] = parsePlayList()
  // 如果稍后播放列表存在歌曲则直接播放该列表的歌曲
  if (playerState.playMusicInfo?.playLater) {
    if (playLaterList.length > 1) {
      let index = playLaterList.findIndex((m) => m.itemId == playerState.playMusicInfo!.itemId)
      if (index < 0) {
        console.warn("Can't find a target musicInfo")
        index = 0
      } else if (++index >= playLaterList.length) index = 0
      return playLaterList[index]
    }
  } else if (playLaterList.length) {
    return playLaterList[0]
  }

  if (
    !playList.length ||
    (playList.length == 1 &&
      playerState.playMusicInfo &&
      !playerState.playMusicInfo.playLater &&
      playerState.dislikeIds.has(playerState.playMusicInfo.itemId))
  ) {
    return null
  }

  let nextIndex = playerState.playInfo.index

  let togglePlayMethod = settingState.setting['player.togglePlayMethod']
  if (togglePlayMethod == 'random') {
    if (playerState.playInfo.historyIndex >= 0) {
      let idx = playerState.playInfo.historyIndex + 1
      while (idx < playerState.playHistoryList.length) {
        const targetId = playerState.playHistoryList[idx].id
        const targetMusicInfo = playerState.playList.find((m) => m.itemId === targetId)
        if (targetMusicInfo) {
          randomNextMusicInfo.info = targetMusicInfo
          randomNextMusicInfo.historyListIndex = idx
          return targetMusicInfo
        }
        idx++
      }
      // console.warn('play history id is not valid', idx, playerState.playHistoryList.length)
    }
    const curItemId = playerState.playMusicInfo?.itemId
    const unPlayedList = playList.filter((m) => !m.played && m.itemId != curItemId)
    let nextPlayMusicInfo: AnyListen.Player.PlayMusicInfo
    let isEnd: boolean
    if (unPlayedList.length) {
      nextPlayMusicInfo = unPlayedList[getRandom(0, unPlayedList.length)]
      isEnd = false
    } else {
      nextPlayMusicInfo = playList[getRandom(0, playList.length)]
      isEnd = true
    }
    randomNextMusicInfo.info = nextPlayMusicInfo
    randomNextMusicInfo.isEnd = isEnd
    randomNextMusicInfo.historyListIndex = -1
    return nextPlayMusicInfo
  }
  switch (togglePlayMethod) {
    case 'listLoop':
      nextIndex = nextIndex == playList.length - 1 ? 0 : nextIndex + 1
      break
    case 'list':
      nextIndex = nextIndex == playList.length - 1 ? -1 : nextIndex + 1
      break
    case 'singleLoop':
      break
    default:
      return null
  }
  if (nextIndex < 0) return null
  return playList[nextIndex]
}

const handlePlayMusicInfo = (info: AnyListen.Player.PlayMusicInfo, historyListIndex = -1) => {
  // setPause()
  setPlayMusicInfo(info, null, historyListIndex)
  handlePlay()
}

/**
 * 下一曲
 * @param isAutoSktp 是否自动切换
 * @returns
 */
export const skipNext = async (isAutoSktp = false): Promise<void> => {
  console.log('skipNext')
  if (isAutoSktp) {
    if (playerState.isPlayedStop) {
      playerEvent.pause()
      commit.setPlaying(false)
      return
    }
  } else if (playerState.isPlayedStop) {
    commit.setPlayedStop(false)
  }
  const [playLaterList, playList] = parsePlayList()
  // 如果稍后播放列表存在歌曲则直接播放该列表的歌曲
  if (playerState.playMusicInfo?.playLater) {
    if (playLaterList.length > 1) {
      let index = playLaterList.findIndex((m) => m.itemId == playerState.playMusicInfo!.itemId)
      if (index < 0) {
        console.warn("Can't find a target musicInfo")
        index = 0
      } else if (++index >= playLaterList.length) index = 0
      handlePlayMusicInfo(playLaterList[index])
      return
    }
  } else if (playLaterList.length) {
    handlePlayMusicInfo(playLaterList[0])
    return
  }

  if (
    !playList.length ||
    (playList.length == 1 &&
      playerState.playMusicInfo &&
      !playerState.playMusicInfo.playLater &&
      playerState.dislikeIds.has(playerState.playMusicInfo.itemId))
  ) {
    handleToggleStop()
    return
  }

  let nextIndex = playerState.playInfo.index

  let togglePlayMethod = settingState.setting['player.togglePlayMethod']
  if (togglePlayMethod == 'random') {
    if (randomNextMusicInfo.info) {
      const isEnd = randomNextMusicInfo.isEnd
      handlePlayMusicInfo(randomNextMusicInfo.info, randomNextMusicInfo.historyListIndex)
      if (isEnd) void setPlayListMusicUnplayedAll()
      return
    }
    if (playerState.playInfo.historyIndex >= 0) {
      let idx = playerState.playInfo.historyIndex + 1
      while (idx < playerState.playHistoryList.length) {
        const targetId = playerState.playHistoryList[idx].id
        const targetMusicInfo = playerState.playList.find((m) => m.itemId === targetId)
        if (targetMusicInfo) {
          handlePlayMusicInfo(targetMusicInfo, idx)
          return
        }
        idx++
      }
      // console.warn('play history id is not valid', idx, playerState.playHistoryList.length)
    }
    const curItemId = playerState.playMusicInfo?.itemId
    const unPlayedList = playList.filter((m) => !m.played && m.itemId != curItemId)
    if (unPlayedList.length) {
      handlePlayMusicInfo(unPlayedList[getRandom(0, unPlayedList.length)])
    } else {
      handlePlayMusicInfo(playList[getRandom(0, playList.length)])
      void setPlayListMusicUnplayedAll()
    }
    return
  }
  if (!isAutoSktp) {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (togglePlayMethod) {
      case 'list':
      case 'singleLoop':
      case 'none':
        togglePlayMethod = 'listLoop'
    }
  }
  switch (togglePlayMethod) {
    case 'listLoop':
      nextIndex = nextIndex == playList.length - 1 ? 0 : nextIndex + 1
      break
    case 'list':
      nextIndex = nextIndex == playList.length - 1 ? -1 : nextIndex + 1
      break
    case 'singleLoop':
      break
    default:
      return
  }
  if (nextIndex < 0) {
    if (!playerState.playerPlaying) commit.setPlaying(false)
    return
  }

  handlePlayMusicInfo(playList[nextIndex])
}

/**
 * 上一曲
 */
export const skipPrev = async (isAutoSktp = false): Promise<void> => {
  if (!isAutoSktp && playerState.isPlayedStop) {
    commit.setPlayedStop(false)
  }

  const [playLaterList, playList] = parsePlayList()

  // 如果稍后播放列表存在歌曲则直接播放该列表的歌曲
  if (playerState.playMusicInfo?.playLater) {
    if (playLaterList.length > 1) {
      let index = playLaterList.findIndex((m) => m.itemId == playerState.playMusicInfo!.itemId)
      if (index < 0) {
        console.warn("Can't find a target musicInfo")
        index = 0
      } else if (--index < 0) index = playLaterList.length - 1
      handlePlayMusicInfo(playLaterList[index])
      return
    }
  } else if (playLaterList.length) {
    handlePlayMusicInfo(playLaterList[0])
    return
  }

  if (
    !playList.length ||
    (playList.length == 1 &&
      playerState.playMusicInfo &&
      !playerState.playMusicInfo.playLater &&
      playerState.dislikeIds.has(playerState.playMusicInfo.itemId))
  ) {
    handleToggleStop()
    return
  }

  let nextIndex = playerState.playInfo.index

  let togglePlayMethod = settingState.setting['player.togglePlayMethod']
  if (togglePlayMethod == 'random') {
    if (playerState.playHistoryList.length) {
      let idx = playerState.playInfo.historyIndex
      idx = idx >= 0 ? idx - 1 : playerState.playHistoryList.length - 1
      while (idx >= 0) {
        const targetId = playerState.playHistoryList[idx].id
        const targetMusicInfo = playerState.playList.find((m) => m.itemId === targetId)
        if (targetMusicInfo) {
          handlePlayMusicInfo(targetMusicInfo, idx)
          return
        }
        idx--
      }
    }
    return
  }
  if (!isAutoSktp) {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (togglePlayMethod) {
      case 'list':
      case 'singleLoop':
      case 'none':
        togglePlayMethod = 'listLoop'
    }
  }
  switch (togglePlayMethod) {
    case 'listLoop':
    case 'list':
      nextIndex = nextIndex == 0 ? playList.length - 1 : nextIndex - 1
      break
    case 'singleLoop':
      break
    default:
      return
  }
  if (nextIndex < 0) return

  handlePlayMusicInfo(playList[nextIndex])
}

/**
 * 恢复播放
 */
export const play = () => {
  if (playerState.playMusicInfo == null) return
  commit.setPlaying(true)
  if (isEmpty()) {
    if (playerState.playMusicInfo.musicInfo.id != gettingUrlId) setMusicUrl(playerState.playMusicInfo.musicInfo)
    return
  }
  setPlay()
}

/**
 * 暂停播放
 */
export const pause = () => {
  commit.setPlaying(false)
  setPause()
}

/**
 * 停止播放
 */
export const stop = () => {
  commit.setPlaying(false)
  setStop()
  commit.setPlayerPlaying(false)
  playerEvent.stop()
}

/**
 * 播放、暂停播放切换
 */
export const togglePlay = () => {
  if (playerState.playing) {
    pause()
  } else {
    play()
  }
}

/**
 * 收藏当前播放的歌曲
 */
export const collectMusic = async () => {
  if (!playerState.playMusicInfo) return
  return addListMusics(LIST_IDS.LOVE, [playerState.playMusicInfo.musicInfo])
}

/**
 * 取消收藏当前播放的歌曲
 */
export const uncollectMusic = () => {
  if (!playerState.playMusicInfo) return
  void removeListMusics(LIST_IDS.LOVE, [playerState.playMusicInfo.musicInfo.id])
}

/**
 * 不喜欢当前播放的歌曲
 */
export const dislikeMusic = async () => {
  if (!playerState.playMusicInfo) return
  const minfo = playerState.playMusicInfo.musicInfo
  await addInfo([{ name: minfo.name, singer: minfo.singer }])
  await skipNext()
}

export const seekTo = (time: number) => {
  playerEvent.setProgress(time)
}
export const setLyricOffset = (offset: number) => {
  playerEvent.setLyricOffset(offset)
}
export const setPlaybackRate = (rate: number) => {
  playerEvent.setPlaybackRate(rate)
}

export const setVolume = (value: number) => {
  playerEvent.setVolume(value)
}

export const setVolumeMute = (value: boolean) => {
  playerEvent.setVolumeIsMute(value)
}

export const setCollectStatus = (status: boolean) => {
  commit.setMusicInfo({ collect: status })
}

export const release = async () => {
  stop()
  commit.setPlayMusicInfo(null)
  commit.setMusicInfo(null)
  commit.updatePlayIndex(-1, -1)
  await releasePlayer()
}
