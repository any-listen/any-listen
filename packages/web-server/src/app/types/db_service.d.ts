declare namespace AnyListen {
  namespace DBService {
    interface MusicInfo {
      id: string
      listId: string
      name: string
      singer: string
      interval: string | null
      isLocal: boolean
      meta: string
      order: number
    }

    interface MusicInfoOrder {
      listId: string
      musicInfoId: string
      order: number
    }

    interface MusicInfoQuery {
      listId: string
    }

    interface MusicInfoRemove {
      listId: string
      id: string
    }

    interface ListMusicInfoQuery {
      listId: string
      musicInfoId: string
    }

    interface UserListInfo {
      id: string
      name: string
      type: string
      meta: string
      position: number
    }

    type Lyricnfo =
      | {
          id: string
          type: 'lyric'
          text: string
          source: 'raw' | 'edited'
        }
      | {
          id: string
          type: keyof Omit<Music.LyricInfo, 'lyric'>
          text: string | null
          source: 'raw' | 'edited'
        }

    interface MusicUrlInfo {
      id: string
      url: string
    }

    interface DownloadMusicInfo {
      id: string
      isComplate: 0 | 1
      status: Download.DownloadTaskStatus
      statusText: string
      progress_downloaded: number
      progress_total: number
      url: string | null
      quality: Music.Quality
      ext: Download.FileExt
      fileName: string
      filePath: string
      musicInfo: string
      position: number
    }

    interface DislikeInfo {
      // type: 'music'
      content: string
      // meta: string | null
    }

    type LogType = 'play'
    interface LogInfo {
      // type: 'music'
      time: number
      type: LogType
      content: string
      // meta: string | null
    }
  }
}
