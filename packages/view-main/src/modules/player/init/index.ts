import { createAudio } from '@/plugins/player'

import { initMediaDevice } from './mediaDevice'
// import usePlayStatus from './usePlayStatus'
import { initMediaSessionInfo } from './mediaSessionInfo'
import { initPlaybackRate } from './playbackRate'
import { initPlayerAudioContext } from './playerAudioContext'
import { initPlayerEvent } from './playerEvent'
import { initPlayErrorHandler } from './playErrorHandler'
import { initPlayKeyboardAction } from './playKeyboardAction'
import { initPlayStatus } from './playStatus'
import { initPreloadNextMusic } from './preloadNextMusic'
import { initProgress } from './progress'
import { initSoundEffect } from './soundEffect'
import { initVolume } from './volume'
import { initWatchList } from './watchList'

export const initPlayer = () => {
  createAudio()

  initPlayerEvent()
  initSoundEffect()
  initMediaDevice() // 初始化音频驱动输出设置
  initPlayerAudioContext()
  initMediaSessionInfo()
  initPlayErrorHandler()
  initPlayStatus()
  initPlayKeyboardAction()
  initVolume()
  initPlaybackRate()
  initProgress()
  initPreloadNextMusic()
  initWatchList()

  // const initPlayStatus1 = usePlayStatus()

  // return () => {
  //   void initPlayStatus1()
  // }
}
