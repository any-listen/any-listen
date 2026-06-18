declare namespace AnyListen {
  namespace Player {
    interface MusicInfo {
      id: string | null
      pic: string | null | undefined
      lrc: string | null
      tlrc: string | null
      rlrc: string | null
      awlrc: string | null
      rawlrc: string | null
      // url: string | null
      name: string
      singer: string
      album: string
      collect: boolean
    }

    type SourceType = 'local' | 'songlist' | 'topSongs' | 'search' | 'album'

    interface PlayMusicInfo {
      /**
       * 当前信息唯一ID
       */
      itemId: string
      /**
       * 当前播放歌曲的列表 id
       */
      musicInfo: Music.MusicInfo
      /**
       * 当前播放歌曲的列表 id
       */
      listId: string
      /**
       * 列表类型
       */
      source: SourceType
      /**
       * 是否属于 “稍后播放”
       */
      playLater: boolean
      /**
       * 是否已播放
       */
      played: boolean
    }

    interface PlayInfo {
      duration: number
      index: number
      listId: string | null
      source: SourceType
      /** 播放列表历史索引，随机模式下使用 */
      historyIndex: number
      /** 上一首播放的歌曲ID */
      lastTrackId: string | null
      isLinkedList: boolean
    }

    interface TempPlayListItem {
      /**
       * 播放列表id
       */
      listId: string
      /**
       * 歌曲信息
       */
      musicInfo: Music.MusicInfo
      /**
       * 是否添加到列表顶部
       */
      isTop?: boolean
    }

    interface SavedPlayInfo {
      time: number
      maxTime: number
      index: number
      /** 播放列表历史索引，随机模式下使用 */
      historyIndex: number
      /** 上一首播放的歌曲ID */
      lastTrackId: string | null
      isLinkedList: boolean
    }
  }
}
