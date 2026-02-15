declare namespace AnyListen {
  namespace IPCPlayer {
    type ActionPlayer =
      | IPCAction<'prev'>
      | IPCAction<'next'>
      | IPCAction<'pause'>
      | IPCAction<'stop'>
      | IPCAction<'play'>
      | IPCAction<'toggle'>
      | IPCAction<'skip', string>
      | IPCAction<'seek', number>
      | IPCAction<'collectStatus', boolean>

    interface PlayerActionSet {
      listId: string | null
      list: Player.PlayMusicInfo[]
      isOnline: boolean
      isSync?: boolean
    }
    interface PlayerActionAdd {
      musics: Player.PlayMusicInfo[]
      pos: number
    }
    type PlayerActionUpdate = Player.PlayMusicInfo[]
    type PlayerActionRemove = string[]
    type PlayerActionPlayed = string[]
    type PlayerActionUnplayed = string[]
    interface PlayerActionPosUpdate {
      musics: string[]
      pos: number
    }
    type PlayListAction =
      | IPCAction<'set', PlayerActionSet>
      | IPCAction<'add', PlayerActionAdd>
      | IPCAction<'remove', PlayerActionRemove>
      | IPCAction<'update', PlayerActionUpdate>
      | IPCAction<'played', PlayerActionPlayed>
      | IPCAction<'unplayed', PlayerActionUnplayed>
      | IPCAction<'unplayedAll'>
      | IPCAction<'posUpdate', PlayerActionPosUpdate>

    interface PlayHistoryListItem {
      id: string
      time: number
    }
    type PlayHistoryListActionSet = PlayHistoryListItem[]
    type PlayHistoryListActionAdd = PlayHistoryListItem[]
    type PlayHistoryListActionRemove = number[]
    type PlayHistoryListAction =
      | IPCAction<'setList', PlayHistoryListActionSet>
      | IPCAction<'addList', PlayHistoryListActionAdd>
      | IPCAction<'removeIdx', number[]>

    interface Progress {
      nowPlayTime: number
      maxPlayTime: number
      progress: number
      nowPlayTimeStr: string
      maxPlayTimeStr: string
    }

    type PlayerStatus = 'playing' | 'paused' | 'stopped' | 'loading' | 'buffering' | 'ended' | 'error'

    /** 播放器实时状态 / 用户期望的播放状态 */
    type Status = [PlayerStatus, boolean]
    type PlayerEvent =
      | IPCAction<'musicChanged', { index: number; historyIndex: number; lastTrackId?: string | null }>
      | IPCAction<'musicInfoUpdated', Partial<Player.MusicInfo>>
      | IPCAction<'playInfoUpdated', Partial<Player.PlayInfo>>
      | IPCAction<'progress', Progress>
      | IPCAction<'playbackRate', number>
      | IPCAction<'status', Status>
      | IPCAction<'statusText', string>
      | IPCAction<'lyricText', string>
      | IPCAction<'picUpdated', string | null>
      | IPCAction<'lyricUpdated', Music.LyricInfo>
      | IPCAction<'lyricOffsetUpdated', number>

    interface SavedPlayInfo {
      time: number
      maxTime: number
      index: number
      historyIndex: number
      lastTrackId: string | null
    }
    interface PlayInfo {
      info: SavedPlayInfo
      list: Player.PlayMusicInfo[]
      listId: string | null
      isOnline: boolean
      historyList: PlayHistoryListItem[]
      isCollect: boolean
    }

    type ServerActions = WarpPromiseRecord<{
      /** 获取播放信息 */
      getPlayInfo: () => PlayInfo
      /** 歌曲播放事件 */
      playerEvent: (event: PlayerEvent) => void
      playListAction: (action: PlayListAction) => void
      playHistoryListAction: (action: PlayHistoryListAction) => void
    }>
    type ServerIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ServerActions>

    type ClientActions = WarpPromiseRecord<{
      /** 播放器操作 */
      playerAction: (action: ActionPlayer) => void
      playListAction: (action: PlayListAction) => void
      playHistoryListAction: (action: PlayHistoryListAction) => void
    }>
    type ClientIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ClientActions>
  }
}
