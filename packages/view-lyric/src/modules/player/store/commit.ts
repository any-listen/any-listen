import { playerEvent } from './event'
import { playerState } from './state'

type PlayerMusicInfoKeys = keyof AnyListen.Player.MusicInfo
const musicInfoKeys: PlayerMusicInfoKeys[] = Object.keys(playerState.musicInfo) as PlayerMusicInfoKeys[]

export const setMusicInfo = (_musicInfo: Partial<AnyListen.Player.MusicInfo> | null) => {
  _musicInfo ||= {
    id: null,
    pic: null,
    lrc: null,
    tlrc: null,
    rlrc: null,
    awlrc: null,
    rawlrc: null,
    name: '',
    singer: '',
    album: '',
    collect: false,
  }
  let changedInfo: Partial<AnyListen.Player.MusicInfo> = {}
  for (const key of musicInfoKeys) {
    const val = _musicInfo[key]
    if (val !== undefined) {
      // @ts-expect-error
      playerState.musicInfo[key] = val
      // @ts-expect-error
      changedInfo[key] = val
    }
  }

  if (Object.keys(changedInfo).length == 0) return
  playerEvent.musicInfoChanged(changedInfo)
}

export const setPlaying = (playing: boolean) => {
  if (playerState.playing == playing) return
  playerState.playing = playing

  playerEvent.playStatusChanged(playing)
}

export const setPlayerPlaying = (playerPlaying: boolean) => {
  playerState.playerPlaying = playerPlaying

  playerEvent.playerPlayStatusChanged(playerPlaying)
}

export const setStatusText = (statusText: string) => {
  playerState.statusText = statusText
  playerEvent.statusTextChanged(statusText)
}

export const setProgress = (progress: AnyListen.IPCPlayer.Progress) => {
  const oldProgress = { ...playerState.progress }

  playerState.progress.nowPlayTime = progress.nowPlayTime
  playerState.progress.nowPlayTimeStr = progress.nowPlayTimeStr
  playerState.progress.maxPlayTime = progress.maxPlayTime
  playerState.progress.maxPlayTimeStr = progress.maxPlayTimeStr
  playerState.progress.progress = progress.progress

  playerEvent.durationChanged({ ...playerState.progress })
  playerEvent.progressChanged({ ...playerState.progress }, oldProgress)
}

export const setLoadErrorPicUrl = (url: string) => {
  playerState.loadErrorPicUrl = url
}

export const setVolume = (volume: number) => {
  playerState.volume = volume
  playerEvent.volumeChanged(volume)
}
export const setVolumeMute = (mute: boolean) => {
  playerState.volumeMute = mute
  playerEvent.volumeMuteChanged(mute)
}

export const setPlaybackRate = (rate: number) => {
  playerState.playbackRate = rate
  playerEvent.playbackRateUpdated(rate)
}
