import { onWinMainIPCDisconnected } from '@/modules/app/shared'
import { settingEvent } from '@/modules/setting/store/event'
import { createUnsubscriptionSet } from '@/shared'
import { getPlayerInfo } from '@/shared/ipcMain'

import { initPlayer as initPlayerModules } from './init/index'
import {
  registerPlayerRemoteEvent,
  sendCreatedEvent,
  sendInitedEvent,
  setLoadErrorPicUrl,
  setMusicInfo,
  setStatePlaybackRate,
  setPlayerPlaying,
  setPlaying,
  setProgress,
  setStatusText,
} from './store/actions'

const init = async (isInited: boolean) => {
  sendCreatedEvent()
  initPlayerModules()
  const info = await getPlayerInfo()
  console.log(info)
  setMusicInfo(info.musicInfo)
  setPlayerPlaying(info.playerPlaying)
  setPlaying(info.playing)
  setStatusText(info.statusText)
  setLoadErrorPicUrl(info.loadErrorPicUrl)
  setProgress(info.progress)
  setStatePlaybackRate(info.playbackRate)
  sendInitedEvent()
}

let unregistereds = createUnsubscriptionSet()
export const initPlayer = () => {
  let isInit = false
  onWinMainIPCDisconnected(() => {
    isInit &&= false
    unregistereds.clear()
  })
  settingEvent.on('inited', () => {
    unregistereds.register((subscriptions) => {
      subscriptions.add(registerPlayerRemoteEvent())
    })
    void init(isInit)
    isInit ||= true
  })
}
