import { onRelease } from '@/modules/app/shared'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { setMusicUrl, setStatusText, skipNext } from '../store/actions'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

let retryNum = 0
let prevTimeoutId: string | null = null

let loadingTimeout: number | null = null
let delayNextTimeout: number | null = null

const startLoadingTimeout = () => {
  // console.log('start load timeout')
  clearLoadingTimeout()
  loadingTimeout = setTimeout(() => {
    if (!playerState.playing) {
      prevTimeoutId = null
      // setStatusText('')
      return
    }

    // 如果加载超时，则尝试刷新URL
    if (prevTimeoutId == playerState.musicInfo.id) {
      prevTimeoutId = null
      void skipNext(true)
    } else {
      prevTimeoutId = playerState.musicInfo.id
      // TODO
      if (playerState.playMusicInfo) setMusicUrl(playerState.playMusicInfo.musicInfo, true)
    }
  }, 25000)
}
const clearLoadingTimeout = () => {
  if (!loadingTimeout) return
  // console.log('clear load timeout')
  clearTimeout(loadingTimeout)
  loadingTimeout = null
}

const clearDelayNextTimeout = () => {
  // console.log(this.delayNextTimeout)
  if (!delayNextTimeout) return
  clearTimeout(delayNextTimeout)
  delayNextTimeout = null
}
const addDelayNextTimeout = () => {
  clearDelayNextTimeout()
  delayNextTimeout = setTimeout(() => {
    if (!playerState.playing) {
      // setStatusText('')
      return
    }
    void skipNext(true)
  }, 5000)
}

const handleLoadeddata = () => {
  if (!playerState.playing) return
  setStatusText(i18n.t('player__loading'))
}

const handlePlaying = () => {
  setStatusText(i18n.t('player__playing'))
  clearLoadingTimeout()
}

const handleEmpied = () => {
  clearDelayNextTimeout()
  clearLoadingTimeout()
}

const handleWating = () => {
  if (!playerState.playing) return
  setStatusText(i18n.t('player__buffering'))
}

const handleError = (errCode?: number) => {
  if (!playerState.musicInfo.id) return
  clearLoadingTimeout()
  if (!playerState.playing) return
  // if (!isEmpty()) stop()
  if (playerState.playMusicInfo && errCode !== 1 && retryNum < 2) {
    // 若音频URL无效则尝试刷新2次URL
    // console.log(this.retryNum)
    retryNum++
    setMusicUrl(playerState.playMusicInfo.musicInfo, true)
    setStatusText(i18n.t('player__refresh_url'))
    return
  }

  if (settingState.setting['player.autoSkipOnError']) {
    if (document.hidden) {
      console.warn('error skip to next')
      void skipNext(true)
    } else {
      setStatusText(i18n.t('player__error'))
      setTimeout(addDelayNextTimeout)
    }
  }
}

const handleSetPlayInfo = () => {
  retryNum = 0
  prevTimeoutId = null
  clearDelayNextTimeout()
  clearLoadingTimeout()
}

let unregistered = createUnsubscriptionSet()
export const initPlayErrorHandler = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      // const handlePlayedStop = () => {
      //   clearDelayNextTimeout()
      //   clearLoadingTimeout()
      // }
      unregistered.add(
        playerEvent.on('playerLoadstart', () => {
          if (!playerState.playing) return
          if (settingState.setting['player.autoSkipOnError']) startLoadingTimeout()
          setStatusText(i18n.t('player__loading'))
        })
      )
      unregistered.add(playerEvent.on('playerLoadeddata', handleLoadeddata))
      unregistered.add(playerEvent.on('playerPlaying', handlePlaying))
      unregistered.add(playerEvent.on('playerWaiting', handleWating))
      unregistered.add(playerEvent.on('playerEmptied', handleEmpied))
      unregistered.add(playerEvent.on('playerError', handleError))
      unregistered.add(playerEvent.on('musicChanged', handleSetPlayInfo))
    })
  })
}
