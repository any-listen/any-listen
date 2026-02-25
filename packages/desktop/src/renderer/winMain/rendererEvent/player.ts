import { getPlayInfo, playerEvent } from '@/modules/player'

import type { ExposeFunctions } from '.'

// 暴露给前端的方法
export const createExposePlayer = () => {
  return {
    async getPlayInfo(event) {
      return getPlayInfo()
    },
    async playerEvent(event, pEvent): Promise<void> {
      switch (pEvent.action) {
        case 'musicChanged':
          playerEvent.musicChanged(pEvent.data.index, pEvent.data.historyIndex, pEvent.data.lastTrackId)
          break
        case 'musicInfoUpdated':
          playerEvent.musicInfoUpdated(pEvent.data)
          break
        case 'progress':
          playerEvent.progress(pEvent.data)
          break
        case 'playbackRate':
          playerEvent.playbackRate(pEvent.data)
          break
        case 'status':
          playerEvent.status(pEvent.data)
          break
        case 'statusText':
          playerEvent.statusText(pEvent.data)
          break
        case 'lyricText':
          playerEvent.lyricText(pEvent.data)
          break
        case 'picUpdated':
          playerEvent.picUpdated(pEvent.data)
          break
        case 'lyricUpdated':
          playerEvent.lyricUpdated(pEvent.data)
          break
        case 'lyricOffsetUpdated':
          playerEvent.lyricOffsetUpdated(pEvent.data)
          break
        case 'playInfoUpdated':
          playerEvent.playInfoUpdated(pEvent.data)
          break
        // default:
        //   // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
        //   let neverValue: never = pEvent
      }
      playerEvent.playerEvent(pEvent)
    },
    async playListAction(event, action) {
      return playerEvent.playListAction(action)
    },
    async playHistoryListAction(event, action) {
      return playerEvent.playHistoryListAction(action)
    },
  } satisfies Partial<ExposeFunctions>
}
