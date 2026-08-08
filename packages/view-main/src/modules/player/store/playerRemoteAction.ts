import { createCache } from '@any-listen/common/cache'
import { checkPicUrl } from '@any-listen/web'

import { appState } from '@/modules/app/store/state'
import { extensionEvent } from '@/modules/extension/store/event'
import { lyricEvent } from '@/modules/lyric/store/event'
import { updateListMusic } from '@/modules/musicLibrary/store/actions'
import { musicLibraryEvent } from '@/modules/musicLibrary/store/event'
import { settingState } from '@/modules/setting/store/state'
import { getMusicPic as getMusicPicFromRemote, getMusicUrl as getMusicUrlFromRemote } from '@/shared/ipc/music'
import { sendPlayerEvent as sendRemotePlayerEvent, sendPlayHistoryListAction } from '@/shared/ipc/player'
import { playerActionEvent, playHistoryListActionEvent } from '@/shared/ipc/player/event'
import { sendPlayerEvent as sendWinLyricPlayerEvent } from '@/shared/ipcLyric'

import * as commit from './commit'
import { playerEvent } from './event'
import {
  dislikeMusic,
  pause,
  play,
  playId,
  seekTo,
  setCollectStatus,
  setLyricOffset,
  setPlaybackRate,
  setVolume,
  setVolumeMute,
  skipNext,
  skipPrev,
  togglePlay,
} from './playerActions'
import { playerState } from './state'

export { getPlayInfo } from '@/shared/ipc/player'

export { getMusicLyric } from '@/shared/ipc/music'

const picCache = createCache<AnyListen.IPCMusic.MusicPicInfo>()
const picCacheQueue: string[] = []
const picRemoteGettingPromises = new Map<string, Promise<AnyListen.IPCMusic.MusicPicInfo>>()

interface GetMusicPicInfo extends AnyListen.IPCMusic.GetMusicPicInfo {
  listId?: string | null
  source?: AnyListen.Player.SourceType | null
}

const handleGetMusicPicFromRemote = async (info: AnyListen.IPCMusic.GetMusicPicInfo) => {
  const urlInfo = await getMusicPicFromRemote(info)
  if (urlInfo.isFromCache) {
    const isValid = await checkPicUrl(urlInfo.url, settingState.setting['network.proxyAllResources'], appState.machineId)
    if (!isValid && !info.isRefresh) {
      return handleGetMusicPicFromRemote({ ...info, isRefresh: true })
    }
  }

  return urlInfo
}

const handleGetMusicPic = async (info: GetMusicPicInfo) => {
  // console.trace('handleGetMusicPicFromRemote', info.musicInfo.name, info.isRefresh)
  if (picRemoteGettingPromises.has(info.musicInfo.id)) return picRemoteGettingPromises.get(info.musicInfo.id)!
  const promise = handleGetMusicPicFromRemote(info)
    .then((urlInfo) => {
      const isNotOtherDeviceLocal =
        info.source == 'local' && !(info.musicInfo.isLocal && info.musicInfo.meta.deviceId != appState.machineId)
      // console.log('urlInfo.url', urlInfo.url)
      if (info.musicInfo.meta.picUrl != urlInfo.url && isNotOtherDeviceLocal) {
        info.musicInfo.meta.picUrl = urlInfo.url
      }
      if (info.listId && isNotOtherDeviceLocal) {
        void updateListMusic(info.listId, info.musicInfo)
      }
      playerEvent.listMusicPicUpdated(info.musicInfo, info.listId, info.source)
      picCache.set(info.musicInfo.id, urlInfo)
      picCacheQueue.push(info.musicInfo.id)
      if (picCacheQueue.length > 100) {
        picCache.delete(picCacheQueue.shift()!)
      }
      return urlInfo
    })
    .finally(() => {
      picRemoteGettingPromises.delete(info.musicInfo.id)
    })
  picRemoteGettingPromises.set(info.musicInfo.id, promise)

  return promise
}
const getPicFromCache = (id: string) => {
  if (picCache.has(id)) {
    picCacheQueue.splice(picCacheQueue.indexOf(id), 1)
    picCacheQueue.push(id)
    return picCache.get(id)!
  }
  return null
}

export const getMusicPic = async (info: GetMusicPicInfo): Promise<AnyListen.IPCMusic.MusicPicInfo> => {
  if (!info.isRefresh) {
    const cache = getPicFromCache(info.musicInfo.id)
    if (cache) return cache

    if (info.musicInfo.meta.picUrl) {
      return {
        url: info.musicInfo.meta.picUrl,
        isFromCache: true,
      }
    }
  }
  return handleGetMusicPic(info)
}

// const runDelayPicTimeout = (info: AnyListen.IPCMusic.GetMusicPicInfo, onUrl: (url: string) => void, isCanceled: () => boolean, ) => {
//   let timeout: number | null = setTimeout(() => {
//     timeout = null
//     void handleGetMusicPicFromRemote(info).then((urlInfo) => {
//       picCache.set(info.musicInfo.id, urlInfo)
//       picCacheQueue.push(info.musicInfo.id)
//       if (picCacheQueue.length > 100) {
//         picCache.delete(picCacheQueue.shift()!)
//       }
//       if (isCanceled) return
//       onUrl(urlInfo.url)
//     })
//   }, 1000)
// }
const findUpdatedMusic = (
  listId: string | null | undefined,
  targetId: string,
  infos: Map<string, AnyListen.Music.MusicInfo[]>
) => {
  if (listId) {
    const list = infos.get(listId)
    if (list) {
      for (const m of list) {
        if (m.id === targetId) {
          return [m, null] as const
        }
      }
    }
  }
  for (const list of infos.values()) {
    for (const m of list) {
      if (m.id === targetId) {
        return [null, m] as const
      }
    }
  }
  return null
}
export const getMusicPicDelay = (info: GetMusicPicInfo, onUrl: (url: string) => void) => {
  if (!info.isRefresh) {
    const cache = getPicFromCache(info.musicInfo.id)
    if (cache) {
      onUrl(cache.url)
      return
    }
    if (info.musicInfo.meta.picUrl) {
      onUrl(info.musicInfo.meta.picUrl)
      return
    }
  }

  let isCanceled = false
  let lastPicUrl = info.musicInfo.meta.picUrl
  let failed = false
  const handleOnUrl = (url: string) => {
    failed = false
    if (unsubResListChanged) {
      unsubResListChanged()
      unsubResListChanged = null
    }
    lastPicUrl = url
    onUrl(url)
  }
  const unsub = musicLibraryEvent.on('listMusicUpdated', (infos) => {
    if (isCanceled) return
    let result = findUpdatedMusic(info.listId, info.musicInfo.id, infos)
    if (!result) return
    let targetMusic = result[0] || result[1]
    if (targetMusic.meta.picUrl) {
      if (targetMusic.meta.picUrl == lastPicUrl) return
      handleOnUrl(targetMusic.meta.picUrl)
    } else if (result[0] && targetMusic.meta.unparsed != info.musicInfo.meta.unparsed) {
      // Metadata has been parsed, fetch the pic again
      void handleGetMusicPic({ ...info, musicInfo: result[0] }).then((urlInfo) => {
        if (isCanceled) return
        handleOnUrl(urlInfo.url)
      })
    }
  })
  let unsubResListChanged = extensionEvent.on('resourceListUpdated', (list) => {
    if (isCanceled || !failed || (!list.resources.musicPic?.length && !list.resources.musicPicSearch?.length)) return
    void handleGetMusicPic(info)
      .then((urlInfo) => {
        if (isCanceled) return
        handleOnUrl(urlInfo.url)
      })
      .catch(() => {
        failed = true
      })
  }) as (() => void) | null
  if (info.musicInfo.meta.unparsed) {
    return () => {
      unsub()
      unsubResListChanged?.()
      isCanceled = true
    }
  }
  let timeout: number | null = setTimeout(() => {
    timeout = null
    void handleGetMusicPic(info)
      .then((urlInfo) => {
        if (isCanceled) return
        handleOnUrl(urlInfo.url)
      })
      .catch(() => {
        failed = true
      })
  }, 1000)
  return () => {
    unsub()
    unsubResListChanged?.()
    isCanceled = true
    if (!timeout) return
    clearTimeout(timeout)
  }
}

const getOtherSourcePromises = new Map<string, Promise<AnyListen.IPCMusic.MusicUrlInfo>>()
let prevProgress = {
  duration: 0,
  currentTime: 0,
}
export const getMusicUrl = async (info: AnyListen.IPCMusic.GetMusicUrlInfo): Promise<AnyListen.IPCMusic.MusicUrlInfo> => {
  let key = `${info.musicInfo.id}_${info.quality}_${info.isRefresh}`

  if (getOtherSourcePromises.has(key)) return getOtherSourcePromises.get(key)!

  const promise = new Promise<AnyListen.IPCMusic.MusicUrlInfo>((resolve, reject) => {
    let timeout: null | number = setTimeout(() => {
      timeout = null
      reject(new Error('find music timeout'))
    }, 30_000)
    getMusicUrlFromRemote(info)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        if (timeout) clearTimeout(timeout)
      })
  }).finally(() => {
    if (getOtherSourcePromises.has(key)) getOtherSourcePromises.delete(key)
  })
  getOtherSourcePromises.set(key, promise)
  return promise
}

/**
 * 覆盖历史播放列表
 * @param data
 */
export const setPlayHistoryList = async (data: AnyListen.IPCPlayer.PlayHistoryListActionSet) => {
  console.warn('setPlayHistoryList', data)
  commit.setPlayHistoryList(data)
  await sendPlayHistoryListAction({ action: 'setList', data })
}

/**
 * 添加历史播放列表
 * @param data
 */
export const addPlayHistoryList = async (data: AnyListen.IPCPlayer.PlayHistoryListActionAdd) => {
  await sendPlayHistoryListAction({ action: 'addList', data })
}

/**
 * 移除历史播放列表
 * @param data
 */
export const removePlayHistoryList = async (data: AnyListen.IPCPlayer.PlayHistoryListActionRemove) => {
  await sendPlayHistoryListAction({ action: 'removeIdx', data })
}

const sendPlayerEvent = async (event: AnyListen.IPCPlayer.PlayerEvent) => {
  await sendRemotePlayerEvent(event)
  void sendWinLyricPlayerEvent(event)
}
let unregistereds = new Set<() => void>()
export const registerLocalPlayerAction = () => {
  let preStatus: AnyListen.IPCPlayer.PlayerStatus = 'stopped'
  unregistereds.add(
    playerEvent.on('playerPlaying', () => {
      preStatus = 'playing'
      void sendPlayerEvent({ action: 'status', data: ['playing', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerPause', () => {
      preStatus = 'paused'
      void sendPlayerEvent({ action: 'status', data: ['paused', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerStop', () => {
      preStatus = 'stopped'
      void sendPlayerEvent({ action: 'status', data: ['stopped', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerLoadstart', () => {
      preStatus = 'loading'
      void sendPlayerEvent({ action: 'status', data: ['loading', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerWaiting', () => {
      preStatus = 'buffering'
      void sendPlayerEvent({ action: 'status', data: ['buffering', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerEnded', () => {
      preStatus = 'ended'
      void sendPlayerEvent({ action: 'status', data: ['ended', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerEmptied', () => {
      preStatus = 'paused'
      void sendPlayerEvent({ action: 'status', data: ['paused', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerError', () => {
      preStatus = 'error'
      void sendPlayerEvent({ action: 'status', data: ['error', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('stop', () => {
      preStatus = 'stopped'
      void sendPlayerEvent({ action: 'status', data: ['stopped', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playStatusChanged', (state) => {
      void sendPlayerEvent({ action: 'status', data: [preStatus, state] })
    })
  )
  unregistereds.add(
    playerEvent.on('statusTextChanged', (text) => {
      void sendPlayerEvent({ action: 'statusText', data: text })
    })
  )
  if (import.meta.env.VITE_IS_DESKTOP) {
    unregistereds.add(
      lyricEvent.on('lineChanged', (text) => {
        void sendPlayerEvent({ action: 'lyricText', data: text })
      })
    )
  }
  unregistereds.add(
    playerEvent.on('progressChanged', (progress) => {
      if (import.meta.env.VITE_IS_WEB) {
        let requiredUpdate = false
        if (prevProgress.duration != progress.maxPlayTime) {
          requiredUpdate = true
          prevProgress.duration = progress.maxPlayTime
        }
        const curTime = Math.round(progress.nowPlayTime)
        if (prevProgress.currentTime != curTime) {
          requiredUpdate = true
          prevProgress.currentTime = curTime
        }
        if (requiredUpdate) {
          void sendPlayerEvent({ action: 'progress', data: progress })
        }
      } else {
        void sendPlayerEvent({ action: 'progress', data: progress })
      }
    })
  )
  unregistereds.add(
    playerEvent.on('musicChanged', (index, historyIndex, lastTrackId) => {
      void sendPlayerEvent({ action: 'musicChanged', data: { index, historyIndex, lastTrackId } })
    })
  )
  unregistereds.add(
    playerEvent.on('musicInfoChanged', (info) => {
      void sendPlayerEvent({ action: 'musicInfoUpdated', data: info })
    })
  )
  unregistereds.add(
    playerEvent.on('playInfoChanged', (info) => {
      void sendPlayerEvent({ action: 'playInfoUpdated', data: info })
    })
  )
  unregistereds.add(
    playerEvent.on('picUpdated', (pic) => {
      void sendPlayerEvent({ action: 'picUpdated', data: pic })
    })
  )
  unregistereds.add(
    playerEvent.on('lyricUpdated', (lyric) => {
      void sendPlayerEvent({ action: 'lyricUpdated', data: lyric })
    })
  )
  unregistereds.add(
    playerEvent.on('lyricOffsetUpdated', (offset) => {
      void sendPlayerEvent({ action: 'lyricOffsetUpdated', data: offset })
    })
  )
  unregistereds.add(
    playerEvent.on('playbackRateUpdated', (rate) => {
      void sendPlayerEvent({ action: 'playbackRate', data: rate })
    })
  )

  return () => {
    if (unregistereds.size) {
      for (const fn of unregistereds.values()) fn()
      unregistereds.clear()
    }
  }
}

export const registerRemotePlayerAction = () => {
  return playerActionEvent.on((action): void => {
    switch (action.action) {
      case 'seek':
        seekTo(action.data)
        break
      case 'skip':
        playId(action.data)
        break
      case 'play':
        play()
        break
      case 'pause':
        pause()
        break
      case 'stop':
        stop()
        break
      case 'toggle':
        togglePlay()
        break
      case 'next':
        void skipNext()
        break
      case 'prev':
        void skipPrev()
        break
      case 'collectStatus':
        setCollectStatus(action.data)
        break
      case 'lyricOffset':
        setLyricOffset(action.data)
        break
      case 'playbackRate':
        setPlaybackRate(action.data)
        break
      case 'volume':
        setVolume(action.data)
        break
      case 'volumeMute':
        setVolumeMute(action.data)
        break
      case 'dislike':
        void dislikeMusic()
        break
      // default:
      //   console.warn('unknown action:', action)
      //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      //   let unknownAction: never = action
    }
  })
}

export const registerRemoteHistoryListAction = () => {
  return playHistoryListActionEvent.on((action): void => {
    switch (action.action) {
      case 'setList':
        commit.setPlayHistoryList(action.data)
        break
      case 'addList':
        commit.addPlayHistoryList(action.data)
        break
      case 'removeIdx':
        commit.removePlayHistoryList(action.data)
        break
      // default:
      //   console.warn('unknown action:', action)
      //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      //   let unknownAction: never = action
    }
  })
}
