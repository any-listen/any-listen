import { getMusicPic as getMusicPicFromRemote, getMusicUrl as getMusicUrlFromRemote } from '@/shared/ipc/music'
import { onPlayHistoryListAction, onPlayerAction, sendPlayHistoryListAction, sendPlayerEvent } from '@/shared/ipc/player'
import * as commit from './commit'

import { playerEvent } from './event'
import { pause, play, playId, seekTo, setCollectStatus, skipNext, skipPrev, togglePlay } from './playerActions'
import { playerState } from './state'

export { getPlayInfo } from '@/shared/ipc/player'

export { getMusicLyric } from '@/shared/ipc/music'

const picCache = new Map<string, AnyListen.IPCMusic.MusicPicInfo>()
const picCacheQueue: string[] = []

export const getMusicPic = async (info: AnyListen.IPCMusic.GetMusicPicInfo) => {
  if (picCache.has(info.musicInfo.id)) {
    picCacheQueue.splice(picCacheQueue.indexOf(info.musicInfo.id), 1)
    picCacheQueue.push(info.musicInfo.id)
    return picCache.get(info.musicInfo.id)!
  }
  const urlInfo = await getMusicPicFromRemote(info)
  picCache.set(info.musicInfo.id, urlInfo)
  picCacheQueue.push(info.musicInfo.id)
  if (picCacheQueue.length > 100) {
    picCache.delete(picCacheQueue.shift()!)
  }
  return urlInfo
}

export const getMusicPicDelay = (info: AnyListen.IPCMusic.GetMusicPicInfo, onUrl: (url: string) => void) => {
  if (picCache.has(info.musicInfo.id)) {
    onUrl(picCache.get(info.musicInfo.id)!.url)
    return
  }
  let isCanceled = false
  let timeout: number | null = setTimeout(() => {
    timeout = null
    void getMusicPicFromRemote(info).then((urlInfo) => {
      picCache.set(info.musicInfo.id, urlInfo)
      picCacheQueue.push(info.musicInfo.id)
      if (picCacheQueue.length > 100) {
        picCache.delete(picCacheQueue.shift()!)
      }
      if (isCanceled) return
      onUrl(urlInfo.url)
    })
  }, 1000)
  return () => {
    if (!timeout) return
    isCanceled = true
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
    }, 15_000)
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
 * 更新歌曲位置
 * @param data
 */
export const setPlayHistoryList = async (data: AnyListen.IPCPlayer.PlayHistoryListActionSet) => {
  console.warn('setPlayHistoryList', data)
  commit.setPlayHistoryList(data)
  await sendPlayHistoryListAction({ action: 'setList', data })
}

/**
 * 更新歌曲位置
 * @param data
 */
export const addPlayHistoryList = async (data: AnyListen.IPCPlayer.PlayHistoryListActionAdd) => {
  await sendPlayHistoryListAction({ action: 'addList', data })
}

/**
 * 更新歌曲位置
 * @param data
 */
export const removePlayHistoryList = async (data: AnyListen.IPCPlayer.PlayHistoryListActionRemove) => {
  await sendPlayHistoryListAction({ action: 'removeIdx', data })
}

let unregistereds = new Set<() => void>()
export const registerLocalPlayerAction = () => {
  unregistereds.add(
    playerEvent.on('playerPlaying', () => {
      void sendPlayerEvent({ action: 'status', data: ['playing', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerPause', () => {
      void sendPlayerEvent({ action: 'status', data: ['paused', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerStop', () => {
      void sendPlayerEvent({ action: 'status', data: ['stoped', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerLoadstart', () => {
      void sendPlayerEvent({ action: 'status', data: ['loading', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerWaiting', () => {
      void sendPlayerEvent({ action: 'status', data: ['buffering', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerEnded', () => {
      void sendPlayerEvent({ action: 'status', data: ['ended', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('playerError', () => {
      void sendPlayerEvent({ action: 'status', data: ['error', playerState.playing] })
    })
  )
  unregistereds.add(
    playerEvent.on('statusTextChanged', (text) => {
      void sendPlayerEvent({ action: 'statusText', data: text })
    })
  )
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
    playerEvent.on('musicChanged', (index, historyIndex) => {
      void sendPlayerEvent({ action: 'musicChanged', data: { index, historyIndex } })
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
  return onPlayerAction((action): void => {
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
      // default:
      //   console.warn('unknown action:', action)
      //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      //   let unknownAction: never = action
    }
  })
}

export const registerRemoteHistoryListAction = () => {
  return onPlayHistoryListAction((action): void => {
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
