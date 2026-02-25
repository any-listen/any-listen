import emptyAudioSource from '@/assets/medias/Silence02s.mp3'
import { onRelease } from '@/modules/app/shared'
import { lyricEvent } from '@/modules/lyric/store/event'
import { settingEvent } from '@/modules/setting/store/event'
import { settingState } from '@/modules/setting/store/state'
import { getCurrentTime, getDuration, getPlaybackRate } from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { pause, play, seekTo, skipNext, skipPrev, stop } from '../store/actions'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

let unregistered = createUnsubscriptionSet()
export const initMediaSessionInfo = () => {
  onRelease(unregistered.clear.bind(unregistered))
  // 创建一个空白音频以保持对 Media Session 的注册
  const emptyAudio = new Audio()
  emptyAudio.autoplay = false
  emptyAudio.src = emptyAudioSource
  emptyAudio.controls = false
  emptyAudio.preload = 'auto'
  emptyAudio.onplaying = () => {
    emptyAudio.pause()
  }
  void emptyAudio.play().catch(() => {})
  let prevPicUrl = ''

  const updateMediaSessionInfo = (lrc?: string) => {
    if (playerState.musicInfo.id == null) {
      navigator.mediaSession.metadata = null
      return
    }
    const mediaMetadata: MediaMetadata = {
      title: playerState.musicInfo.name,
      artist: playerState.musicInfo.singer,
      album: playerState.musicInfo.album,
      artwork: [],
    }
    if (lrc != null) {
      mediaMetadata.title = lrc
      mediaMetadata.artist = playerState.title || ''
    }
    if (playerState.musicInfo.pic) {
      const pic = new Image()
      pic.src = playerState.musicInfo.pic
      prevPicUrl = pic.src
      pic.onload = () => {
        if (prevPicUrl == pic.src) {
          mediaMetadata.artwork = [{ src: pic.src }]
          // @ts-expect-error
          navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetadata)
        }
      }
    } else prevPicUrl = ''

    // @ts-expect-error
    navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetadata)
  }

  const updatePositionState = (
    state: {
      duration?: number
      position?: number
      playbackRate?: number
    } = {}
  ) => {
    try {
      navigator.mediaSession.setPositionState({
        duration: state.duration ?? getDuration(),
        playbackRate: state.playbackRate ?? getPlaybackRate(),
        position: state.position ?? getCurrentTime(),
      })
    } catch (err) {
      console.log(err)
    }
  }

  const setProgress = (time: number) => {
    seekTo(time)
  }

  const handlePause = () => {
    navigator.mediaSession.playbackState = 'paused'
  }
  const handleSetPlayInfo = () => {
    void emptyAudio.play().finally(() => {
      updateMediaSessionInfo()
      updatePositionState({
        position: playerState.progress.nowPlayTime,
        duration: playerState.progress.maxPlayTime,
      })
      handlePause()
    })
  }

  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      navigator.mediaSession.setActionHandler('play', () => {
        if (playerState.playerPlaying || !playerState.playMusicInfo) return
        console.log('play')
        play()
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        if (!playerState.playerPlaying || !playerState.playMusicInfo) return
        console.log('pause')
        pause()
      })
      navigator.mediaSession.setActionHandler('stop', () => {
        console.log('stop')
        stop()
      })
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        console.log('seekbackward')
        const seekOffset = details.seekOffset ?? 5
        setProgress(Math.max(getCurrentTime() - seekOffset, 0))
      })
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        console.log('seekforward')
        const seekOffset = details.seekOffset ?? 5
        setProgress(Math.min(getCurrentTime() + seekOffset, getDuration()))
      })
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        console.log('seekto', details.seekTime)
        if (details.seekTime == null) return
        let time = Math.min(details.seekTime, getDuration())
        time = Math.max(time, 0)
        setProgress(time)
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('previoustrack')
        void skipPrev()
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('nexttrack')
        void skipNext()
      })

      unregistered.add(() => {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('stop', null)
        navigator.mediaSession.setActionHandler('seekbackward', null)
        navigator.mediaSession.setActionHandler('seekforward', null)
        navigator.mediaSession.setActionHandler('seekto', null)
        navigator.mediaSession.setActionHandler('previoustrack', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
      })
      unregistered.add(
        lyricEvent.on('titleLyricChanged', (text) => {
          if (!settingState.setting['player.isShowMediaSessionLyric']) return
          if (text == null) {
            updateMediaSessionInfo()
          } else {
            updateMediaSessionInfo(text)
          }
        })
      )
      unregistered.add(
        settingEvent.on('updated', (keys, settings) => {
          if (keys.includes('player.isShowMediaSessionLyric')) {
            if (!settings['player.isShowMediaSessionLyric']) {
              updateMediaSessionInfo()
            }
          }
        })
      )
      unregistered.add(playerEvent.on('playerLoadeddata', updatePositionState))
      unregistered.add(playerEvent.on('playerPlaying', updatePositionState))
      unregistered.add(
        playerEvent.on('play', () => {
          navigator.mediaSession.playbackState = 'playing'
        })
      )
      unregistered.add(playerEvent.on('pause', handlePause))
      unregistered.add(
        playerEvent.on('stop', () => {
          navigator.mediaSession.playbackState = 'none'
        })
      )
      unregistered.add(playerEvent.on('error', handlePause))
      unregistered.add(playerEvent.on('playerEmptied', handleSetPlayInfo))
      unregistered.add(playerEvent.on('musicChanged', handleSetPlayInfo))
      unregistered.add(
        playerEvent.on('picUpdated', () => {
          updateMediaSessionInfo()
        })
      )
    })
  })
}
