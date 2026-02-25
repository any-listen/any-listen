import { getDocumentHidden, onVisibilityChange } from '@any-listen/web'

import { onRelease } from '@/modules/app/shared'
import { updateListMusic } from '@/modules/musicLibrary/store/actions'
import { settingState } from '@/modules/setting/store/state'
import { getCurrentTime, getDuration, onTimeupdate, setCurrentTime } from '@/plugins/player'
import { createUnsubscriptionSet, formatPlayTime2, getRandom } from '@/shared'

import { onPlayerCreated } from '../shared'
import { setMaxPlayTime, setNowPlayTime, skipNext } from '../store/actions'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

// const delaySavePlayInfo = throttle(savePlayInfo, 2000)

let restorePlayTime = 0
const mediaBuffer: {
  timeout: number | null
  playTime: number
} = {
  timeout: null,
  playTime: 0,
}

// const updateMusicInfo = useCommit('list', 'updateMusicInfo')
const seekTo = (time: number) => {
  setNowPlayTime(time)
  setCurrentTime(time)
}

const startBuffering = () => {
  console.log('start t')
  if (mediaBuffer.timeout) return
  mediaBuffer.timeout = setTimeout(() => {
    mediaBuffer.timeout = null
    if (!playerState.playing) return
    const currentTime = getCurrentTime()

    mediaBuffer.playTime ||= currentTime
    let skipTime = currentTime + getRandom(3, 6)
    if (skipTime > playerState.progress.maxPlayTime) skipTime = (playerState.progress.maxPlayTime - currentTime) / 2
    if (skipTime - mediaBuffer.playTime < 1 || playerState.progress.maxPlayTime - skipTime < 1) {
      mediaBuffer.playTime = 0
      if (settingState.setting['player.autoSkipOnError']) {
        console.warn('buffering end')
        void skipNext(true)
      }
      return
    }
    startBuffering()
    setCurrentTime(skipTime)
    console.log(mediaBuffer.playTime)
    console.log(currentTime)
  }, 3000)
}
const clearBufferTimeout = () => {
  console.log('clear t')
  if (!mediaBuffer.timeout) return
  clearTimeout(mediaBuffer.timeout)
  mediaBuffer.timeout = null
  mediaBuffer.playTime = 0
}

let unregistered = createUnsubscriptionSet()
export const initProgress = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        playerEvent.on('pause', () => {
          clearBufferTimeout()
        })
      )
      unregistered.add(
        playerEvent.on('stop', () => {
          clearBufferTimeout()
          seekTo(0)
        })
      )
      unregistered.add(
        playerEvent.on('error', () => {
          restorePlayTime ||= getCurrentTime() // 记录出错的播放时间
          console.log('handleError')
        })
      )
      unregistered.add(
        playerEvent.on('setProgress', (time: number, maxTime?: number) => {
          if (!playerState.musicInfo.id) return
          console.log('setProgress', time, maxTime)
          restorePlayTime = time
          if (mediaBuffer.playTime) {
            clearBufferTimeout()
            mediaBuffer.playTime = time
            startBuffering()
          }
          if (maxTime != null) setMaxPlayTime(maxTime)
          seekTo(time)
        })
      )
      unregistered.add(
        playerEvent.on('playerLoadeddata', () => {
          setMaxPlayTime(getDuration())
          if (playerState.playMusicInfo && !playerState.playMusicInfo.musicInfo.interval) {
            void updateListMusic(playerState.playMusicInfo.listId, {
              ...playerState.playMusicInfo.musicInfo,
              interval: formatPlayTime2(playerState.progress.maxPlayTime),
            })
          }
        })
      )
      unregistered.add(
        playerEvent.on('playerPlaying', () => {
          console.log('handlePlaying', mediaBuffer.playTime, restorePlayTime)
          clearBufferTimeout()
          if (mediaBuffer.playTime) {
            let playTime = mediaBuffer.playTime
            mediaBuffer.playTime = 0
            setCurrentTime(playTime)
          } else if (restorePlayTime) {
            setCurrentTime(restorePlayTime)
            restorePlayTime = 0
          }
        })
      )
      unregistered.add(
        playerEvent.on('playerWaiting', () => {
          startBuffering()
        })
      )
      unregistered.add(
        playerEvent.on('playerEmptied', () => {
          mediaBuffer.playTime = 0
          clearBufferTimeout()
        })
      )
      unregistered.add(
        playerEvent.on('musicChanged', () => {
          // restorePlayTime = playProgress.nowPlayTime
          seekTo((restorePlayTime = playerState.progress.nowPlayTime))
          // setMaxplayTime(playProgress.maxPlayTime)
          clearBufferTimeout()
        })
      )
      let documentHidden = getDocumentHidden()
      unregistered.add(
        playerEvent.on('progressChanged', (progress, old) => {
          if (documentHidden) return
          if (Math.abs(progress.progress - old.progress) > 0.01) {
            console.log('activePlayProgressTransition')
            playerEvent.activePlayProgressTransition()
          }
        })
      )

      unregistered.add(
        onTimeupdate(() => {
          setNowPlayTime(getCurrentTime())
        })
      )

      let currentPlayProgress = 0
      unregistered.add(
        onVisibilityChange((hidden) => {
          documentHidden = hidden
          if (documentHidden) {
            currentPlayProgress = playerState.progress.progress
          } else if (Math.abs(playerState.progress.progress - currentPlayProgress) > 0.01) {
            playerEvent.activePlayProgressTransition()
          }
        })
      )
    })
  })
}
