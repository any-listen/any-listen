export interface InitState {
  musicInfo: AnyListen.Player.MusicInfo
  playMusicInfo: AnyListen.Player.PlayMusicInfo | null
  playInfo: AnyListen.Player.PlayInfo
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
  playList: AnyListen.Player.PlayMusicInfo[]
  volume: number
  volumeMute: boolean
  playbackRate: number
  isLinkedList: boolean
  isPlayedStop: boolean
  dislikeIds: Set<string>
  playHistoryList: AnyListen.IPCPlayer.PlayHistoryListItem[]
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
  playMusicInfo: null,
  playInfo: {
    duration: 0,
    index: -1,
    listId: '',
    historyIndex: -1,
    isOnline: false,
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
  playList: [],
  volume: 0,
  volumeMute: false,
  playbackRate: 1,
  isLinkedList: false,
  isPlayedStop: false,
  dislikeIds: new Set(),
  playHistoryList: [],
}
