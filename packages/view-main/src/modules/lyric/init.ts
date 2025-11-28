import { onRelease } from '@/modules/app/shared'
import { playerEvent } from '@/modules/player/store/event'
import { playerState } from '@/modules/player/store/state'
import { settingEvent } from '@/modules/setting/store/event'
import { settingState } from '@/modules/setting/store/state'
import { getCurrentTime as getPlayerCurrentTime } from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'
import * as desktopLyric from './desktopLyric'
import * as lyric from './lyric'
import { initMacStatusBarLyric } from './macStatusBarLyric'
import { lyricState } from './store/state'
import { initTitleLyric } from './titleLyric'

const getCurrentTime = () => {
  return getPlayerCurrentTime() * 1000
}

const play = () => {
  // if (!musicInfo.lrc) return
  const currentTime = getCurrentTime()
  lyric.play(currentTime)
  desktopLyric.play(currentTime)
}
const pause = () => {
  lyric.pause()
  desktopLyric.pause()
}

const stop = () => {
  lyric.stop()
  desktopLyric.stop()
}

const setLyricOffset = (offset: number) => {
  const tempOffset = offset - lyricState.offset
  lyric.setOffset(tempOffset)
  desktopLyric.setOffset(tempOffset)
  playerEvent.lyricOffsetUpdated(offset)

  if (playerState.playerPlaying) setTimeout(play)
}

const setPlaybackRate = (rate: number) => {
  lyric.setPlaybackRate(rate)
  desktopLyric.setPlaybackRate(rate)

  if (playerState.playerPlaying) setTimeout(play)
}

const setLyric = () => {
  if (!playerState.musicInfo.id) return
  if (playerState.musicInfo.lrc) {
    const extendedLyrics = []
    if (settingState.setting['player.isShowLyricRoma'] && playerState.musicInfo.rlrc) {
      extendedLyrics.push(playerState.musicInfo.rlrc)
    }
    if (settingState.setting['player.isShowLyricTranslation'] && playerState.musicInfo.tlrc) {
      extendedLyrics.push(playerState.musicInfo.tlrc)
    }
    if (settingState.setting['player.isSwapLyricTranslationAndRoma']) {
      extendedLyrics.reverse()
    }
    lyric.setLyric(
      settingState.setting['player.isPlayAwlrc'] && playerState.musicInfo.awlrc
        ? playerState.musicInfo.awlrc
        : playerState.musicInfo.lrc,
      extendedLyrics
    )
    desktopLyric.setLyric({
      lrc: playerState.musicInfo.lrc,
      tlrc: playerState.musicInfo.tlrc,
      rlrc: playerState.musicInfo.rlrc,
      awlrc: playerState.musicInfo.awlrc,
    })
  }

  if (playerState.playerPlaying) setTimeout(play)
}
const watchSettings = [
  'player.isShowLyricTranslation',
  'player.isShowLyricRoma',
  'player.isSwapLyricTranslationAndRoma',
  'player.isPlayAwlrc',
] satisfies Array<keyof AnyListen.AppSetting>

const unregistered = createUnsubscriptionSet()
export const initLyric = () => {
  onRelease(() => {
    stop()
    unregistered.clear()
  })
  settingEvent.on('inited', () => {
    unregistered.register((subscriptions) => {
      subscriptions.add(lyric.initLyric())
      subscriptions.add(desktopLyric.initDesktopLyric())
      if (import.meta.env.VITE_IS_MAC) subscriptions.add(initMacStatusBarLyric()) // 需在 initTitleLyric 之前初始化
      subscriptions.add(initTitleLyric())
      subscriptions.add(playerEvent.on('lyricUpdated', setLyric))
      subscriptions.add(playerEvent.on('setLyricOffset', setLyricOffset))
      subscriptions.add(playerEvent.on('setPlaybackRate', setPlaybackRate))
      subscriptions.add(
        settingEvent.on('updated', (keys) => {
          if (watchSettings.some((k) => keys.includes(k))) setLyric()
        })
      )
      subscriptions.add(
        playerEvent.on('musicChanged', () => {
          stop()
          desktopLyric.sendMusicInfo(playerState.progress.nowPlayTime * 1000)
        })
      )
      subscriptions.add(playerEvent.on('play', play))
      subscriptions.add(playerEvent.on('pause', pause))
      subscriptions.add(playerEvent.on('stop', stop))
      subscriptions.add(playerEvent.on('error', pause))
    })
  })
}
