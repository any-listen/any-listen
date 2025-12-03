import { onRelease } from '@/modules/app/shared'
import { settingEvent } from '@/modules/setting/store/event'
import { getCurrentTime, onTimeupdate } from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'
import { onPlayerCreated } from '../shared'
import { playerEvent } from '../store/event'
import { getNextPlayMusicInfo, resetRandomNextMusicInfo } from '../store/playerActions'
import { getMusicUrl } from '../store/playerRemoteAction'
import { playerState } from '../store/state'

let audio: HTMLAudioElement
const initAudio = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (audio) return
  audio = new Audio()
  audio.controls = false
  audio.preload = 'auto'
  audio.crossOrigin = 'anonymous'
  audio.muted = true
  audio.volume = 0
  audio.autoplay = true
  audio.addEventListener('playing', () => {
    audio.pause()
  })
}
const checkMusicUrl = async (url: string): Promise<boolean> => {
  initAudio()
  return new Promise((resolve) => {
    const clear = () => {
      audio.removeEventListener('error', handleErr)
      audio.removeEventListener('canplay', handlePlay)
    }
    const handleErr = () => {
      clear()
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code
      // MediaError.MEDIA_ERR_ABORTED
      if (audio.error?.code === 1) {
        resolve(true)
      } else {
        resolve(false)
      }
    }
    const handlePlay = () => {
      clear()
      resolve(true)
    }
    audio.addEventListener('error', handleErr)
    audio.addEventListener('canplay', handlePlay)
    audio.src = url
  })
}

const preloadMusicInfo = {
  isLoading: false,
  preProgress: 0,
  info: null as AnyListen.Player.PlayMusicInfo | null,
}
const resetPreloadInfo = () => {
  preloadMusicInfo.preProgress = 0
  preloadMusicInfo.info = null
  preloadMusicInfo.isLoading = false
}
const preloadNextMusicUrl = async (curTime: number) => {
  if (preloadMusicInfo.isLoading || curTime - preloadMusicInfo.preProgress < 3) return
  preloadMusicInfo.isLoading = true
  console.log('preload next music url')
  const info = await getNextPlayMusicInfo()
  if (info) {
    preloadMusicInfo.info = info
    const { url } = await getMusicUrl({ musicInfo: info.musicInfo }).catch(() => ({ url: '' }))
    if (url) {
      console.log('preload url', url)
      const result = await checkMusicUrl(url)
      if (!result) {
        const { url } = await getMusicUrl({ musicInfo: info.musicInfo, isRefresh: true }).catch(() => ({ url: '' }))
        void checkMusicUrl(url)
        console.log('preload url refresh', url)
      }
    }
  }
  preloadMusicInfo.isLoading = false
}

let unregistered = createUnsubscriptionSet()
export const initPreloadNextMusic = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        playerEvent.on('setProgress', (time: number, maxTime?: number) => {
          if (!playerState.musicInfo.id) return
          preloadMusicInfo.preProgress = time
        })
      )
      unregistered.add(playerEvent.on('musicChanged', resetPreloadInfo))
      unregistered.add(
        settingEvent.on('updated', (keys) => {
          if (keys.includes('player.togglePlayMethod')) {
            if (!preloadMusicInfo.info || preloadMusicInfo.info.playLater) return
            resetRandomNextMusicInfo()
            preloadMusicInfo.info = null
            preloadMusicInfo.preProgress = playerState.progress.nowPlayTime
          }
        })
      )
      unregistered.add(
        onTimeupdate(() => {
          const time = getCurrentTime()
          const duration = playerState.progress.maxPlayTime
          if (duration > 10 && duration - time < 10 && !preloadMusicInfo.info) {
            void preloadNextMusicUrl(time)
          }
        })
      )
    })
  })
}
