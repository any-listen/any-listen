import { playerEvent } from '@/modules/player/store/event'
import { playerState } from '@/modules/player/store/state'
import { settingEvent } from '@/modules/setting/store/event'
import { settingState } from '@/modules/setting/store/state'
import { createUnsubscriptionSet } from '@/shared'

import { onWinMainIPCDisconnected } from '../app/shared'
import * as lyric from './lyric'
import { buildLyricConfig, setOptions } from './lyric'
import { getPlayerCurrentTime, setOffset } from './store/action'

const getCurrentTime = async () => {
  return (await getPlayerCurrentTime()) * 1000
}

const play = async () => {
  // if (!musicInfo.lrc) return
  const currentTime = await getCurrentTime()
  lyric.play(currentTime)
}
const pause = () => {
  lyric.pause()
}
const setTime = async () => {
  const currentTime = await getCurrentTime()
  lyric.setTime(currentTime)
}

const stop = () => {
  lyric.stop()
}

const setLyricOffset = (offset: number) => {
  lyric.setOffset(offset)
  setOffset(offset)
  playerEvent.lyricOffsetUpdated(offset)
  // console.log('setLyricOffset', offset)
  if (playerState.playerPlaying) setTimeout(play)
  else setTimeout(setTime)
}

const setPlaybackRate = (rate: number) => {
  lyric.setPlaybackRate(rate)

  if (playerState.playerPlaying) setTimeout(play)
  else setTimeout(setTime)
}

const setLyric = (lyricInfo?: Omit<AnyListen.Music.LyricInfo, 'id' | 'name' | 'singer' | 'interval'>) => {
  if (!playerState.musicInfo.id) return
  lyricInfo ||= {
    lyric: playerState.musicInfo.lrc ?? '',
    tlyric: playerState.musicInfo.tlrc,
    rlyric: playerState.musicInfo.rlrc,
    awlyric: playerState.musicInfo.awlrc,
  }
  if (lyricInfo.lyric) {
    const extendedLyrics = []
    if (settingState.setting['player.isShowLyricRoma'] && lyricInfo.rlyric) {
      extendedLyrics.push(lyricInfo.rlyric)
    }
    if (settingState.setting['player.isShowLyricTranslation'] && lyricInfo.tlyric) {
      extendedLyrics.push(lyricInfo.tlyric)
    }
    if (settingState.setting['player.isSwapLyricTranslationAndRoma']) {
      extendedLyrics.reverse()
    }
    lyric.setLyric(
      settingState.setting['player.isPlayAwlrc'] && lyricInfo.awlyric ? lyricInfo.awlyric : lyricInfo.lyric,
      extendedLyrics
    )
  }

  if (playerState.playerPlaying) setTimeout(play)
  else setTimeout(setTime)
}
const watchSettings = [
  'player.isShowLyricTranslation',
  'player.isShowLyricRoma',
  'player.isSwapLyricTranslationAndRoma',
  'player.isPlayAwlrc',
] satisfies Array<keyof AnyListen.AppSetting>

const init = () => {
  setLyric()
  setPlaybackRate(playerState.playbackRate)
  if (playerState.playerPlaying) setTimeout(play)
  else setTimeout(setTime)
}

const unregistered = createUnsubscriptionSet()
export const initLyric = () => {
  onWinMainIPCDisconnected(() => {
    stop()
    unregistered.clear()
  })
  settingEvent.on('inited', () => {
    unregistered.register((subscriptions) => {
      subscriptions.add(lyric.initLyric())
      subscriptions.add(playerEvent.on('lyricUpdated', setLyric))
      subscriptions.add(playerEvent.on('lyricOffsetUpdated', setLyricOffset))
      subscriptions.add(playerEvent.on('playbackRateUpdated', setPlaybackRate))
      subscriptions.add(
        settingEvent.on('updated', (keys, settings) => {
          if (watchSettings.some((k) => keys.includes(k))) setLyric()
          if (
            keys.includes('desktopLyric.mode') ||
            keys.includes('desktopLyric.classic.showExtendedLyrics') ||
            keys.includes('desktopLyric.multiLine.direction')
          ) {
            setOptions(buildLyricConfig())
            if (playerState.playerPlaying) setTimeout(play)
            else setTimeout(setTime)
          }
        })
      )
      subscriptions.add(
        playerEvent.on('musicChanged', () => {
          stop()
        })
      )
      subscriptions.add(playerEvent.on('play', play))
      subscriptions.add(playerEvent.on('pause', pause))
      subscriptions.add(playerEvent.on('stop', stop))
      subscriptions.add(playerEvent.on('error', pause))
      subscriptions.add(playerEvent.on('inited', init))
    })
  })
}
