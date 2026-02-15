import { throttle } from '@any-listen/common/utils'
import { workers } from '../worker'
import { getPlayTime, savePlayTime } from './playTimeStore'

let playInfo: AnyListen.Player.SavedPlayInfo

const initPlayInfo = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (playInfo !== undefined) return
  const [info, time] = await Promise.all([workers.dbService.queryMetadataPlayInfo(), getPlayTime()])
  // eslint-disable-next-line require-atomic-updates
  playInfo = info
  if (playInfo.index > -1) playInfo.time = time
}

const savePlayInfoThrottle = throttle(() => {
  void workers.dbService.saveMetadataPlayInfo(playInfo)
}, 500)

const savePlayTimeThrottle = throttle(() => {
  void savePlayTime(playInfo.time)
}, 500)

export const setPlayTime = async (time: number) => {
  await initPlayInfo()
  if (playInfo.time === time) return
  playInfo.time = time
  savePlayTimeThrottle()
}

export const setPlayMusic = async (index: number, historyIndex: number, lastTrackId?: string | null) => {
  await initPlayInfo()
  if (lastTrackId === undefined) lastTrackId = playInfo.lastTrackId
  if (playInfo.index === index && playInfo.historyIndex === historyIndex) return
  playInfo = {
    index,
    time: 0,
    maxTime: 0,
    historyIndex,
    lastTrackId,
  }
  savePlayInfoThrottle()
  savePlayTimeThrottle()
}

export const setPlayInfo = async (duration?: number, index?: number, lastTrackId?: string | null) => {
  await initPlayInfo()
  let updated = false
  if (duration != null) {
    duration = Math.round(duration)
    if (playInfo.maxTime !== duration) {
      playInfo.maxTime = duration
      updated ||= true
    }
  }
  if (index != null && playInfo.index !== index) {
    playInfo.index = index
    updated ||= true
  }
  if (lastTrackId !== undefined && playInfo.lastTrackId !== lastTrackId) {
    playInfo.lastTrackId = lastTrackId
    updated ||= true
  }
  if (!updated) return
  // console.log('setPlayInfo', duration, index)
  savePlayInfoThrottle()
}

export const getPlayInfo = async () => {
  await initPlayInfo()
  return playInfo
}
