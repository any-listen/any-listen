import { createAudio } from '@/plugins/player'
import { initMediaDevice } from './mediaDevice'
import { initPlayerEvent } from './playerEvent'
// import usePlayStatus from './usePlayStatus'
import { initMediaSessionInfo } from './mediaSessionInfo'
import { initPlaybackRate } from './playbackRate'
import { initPlayerAudioContext } from './playerAudioContext'
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
  initMediaDevice() // 初始化音频驱动输出设置
  initMediaSessionInfo()
  initPlayErrorHandler()
  initPlayStatus()
  initPlayerAudioContext()
  initPlayKeyboardAction()
  initVolume()
  initPlaybackRate()
  initSoundEffect()
  initProgress()
  initPreloadNextMusic()
  initWatchList()

  // const initPlayStatus1 = usePlayStatus()

  // return () => {
  //   void initPlayStatus1()
  // }
}
