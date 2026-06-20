import { playerEvent as playerEventRemote } from '@/shared/ipcMain/event'

import * as commit from './commit'
import { playerEvent } from './event'

export const registerPlayerRemoteEvent = () => {
  let preStatus: AnyListen.IPCPlayer.PlayerStatus = 'stopped'
  return playerEventRemote.on((action): void => {
    switch (action.action) {
      case 'status': {
        if (preStatus === action.data[0]) {
          commit.setPlaying(action.data[1])
        } else {
          preStatus = action.data[0]
          switch (preStatus) {
            case 'playing':
              console.log('onPlaying')
              playerEvent.playerPlaying()
              playerEvent.play()
              break
            case 'paused':
              console.log('onPause')
              playerEvent.playerPause()
              playerEvent.pause()
              break
            case 'ended':
              console.log('onEnded')
              playerEvent.playerEnded()
              break
            case 'error':
              playerEvent.playerError()
              playerEvent.error()
              break
            case 'stopped':
              playerEvent.playerStop()
              playerEvent.stop()
              break
            case 'loading':
              playerEvent.playerLoadstart()
              break
            case 'buffering':
              console.log('onWaiting')
              playerEvent.playerWaiting()
              playerEvent.pause()
              break
          }
        }
        break
      }
      case 'musicChanged':
        playerEvent.musicChanged(action.data.index, action.data.historyIndex, action.data.lastTrackId)
        break
      case 'picUpdated':
        playerEvent.picUpdated(action.data)
        break
      case 'lyricOffsetUpdated':
        playerEvent.lyricOffsetUpdated(action.data)
        break
      case 'lyricText':
        break
      case 'lyricUpdated':
        playerEvent.lyricUpdated(action.data)
        break
      case 'musicInfoUpdated':
        commit.setMusicInfo(action.data)
        break
      case 'playInfoUpdated':
        // commit.setPlayInfo(action.data)
        break
      case 'playbackRate':
        commit.setPlaybackRate(action.data)
        break
      case 'progress':
        commit.setProgress(action.data)
        break
      case 'statusText':
        commit.setStatusText(action.data)
        break
    }
  })
}
