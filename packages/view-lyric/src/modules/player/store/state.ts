export interface InitState {
  musicInfo: AnyListen.Player.MusicInfo
  playerPlaying: boolean
  playing: boolean
  statusText: string
  loadErrorPicUrl: string
  progress: {
    nowPlayTime: number
    maxPlayTime: number
    progress: number
    nowPlayTimeStr: string
    maxPlayTimeStr: string
  }
  volume: number
  volumeMute: boolean
  playbackRate: number
}

// const empty = {}
export const playerState: InitState = {
  musicInfo: {
    id: null,
    pic: undefined,
    lrc: null,
    tlrc: null,
    rlrc: null,
    awlrc: null,
    rawlrc: null,
    name: '',
    singer: '',
    album: '',
    collect: false,
  },
  playerPlaying: false,
  playing: false,
  statusText: '',
  loadErrorPicUrl: '',
  progress: {
    nowPlayTime: 0,
    maxPlayTime: 0,
    progress: 0,
    nowPlayTimeStr: '00:00',
    maxPlayTimeStr: '00:00',
  },
  volume: 0,
  volumeMute: false,
  playbackRate: 1,
}
