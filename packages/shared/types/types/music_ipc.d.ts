declare namespace AnyListen {
  namespace IPCMusic {
    // interface LyricInfoSave {
    //   id: string
    //   lyrics: AnyListen.Music.LyricInfo
    // }

    // interface MusicFileMeta {
    //   title: string
    //   artist: string | null
    //   album: string | null
    //   APIC: string | null
    //   lyrics: string | null
    // }

    // interface MusicUrlInfo {
    //   id: string
    //   url: string
    // }

    // interface MusicInfoOtherSourceSave {
    //   id: string
    //   list: MusicInfoOnline[]
    // }

    interface GetMusicUrlInfo {
      musicInfo: Music.MusicInfo
      isRefresh?: boolean
      quality?: Music.Quality
      // toggleSource?: boolean
    }
    interface MusicUrlInfo {
      url: string
      // toggleSource: boolean
      quality: Music.Quality
      isFromCache: boolean
    }

    interface GetMusicPicInfo {
      musicInfo: Music.MusicInfo
      listId?: string | null
      isRefresh?: boolean
      // toggleSource?: boolean
    }

    interface MusicPicInfo {
      url: string
      // toggleSource: boolean
      isFromCache: boolean
    }

    interface MusicLyricInfo {
      info: Music.LyricInfo
      // toggleSource: boolean
      isFromCache: boolean
    }

    type ServerActions = WarpPromiseRecord<{
      /** 获取歌曲链接 */
      getMusicUrl: (info: GetMusicUrlInfo) => MusicUrlInfo
      /** 获取歌曲链接缓存数量 */
      getMusicUrlCount: () => number
      /** 清理歌曲链接缓存 */
      clearMusicUrl: () => void

      /** 获取歌曲链接 */
      getMusicPic: (info: GetMusicPicInfo) => MusicPicInfo

      /** 获取歌词 */
      getMusicLyric: (info: GetMusicPicInfo) => MusicLyricInfo
      /** 保存歌词 */
      setMusicLyric: (id: string, name: string, singer: string, info: Music.LyricInfo) => void
      /** 获取歌词缓存数量 */
      getMusicLyricCount: () => number
      /** 清理歌词缓存 */
      clearMusicLyric: () => void

      /** 批量创建本地音乐信息 */
      createLocalMusicInfos: (filePaths: string[]) => Promise<Music.MusicInfoLocal[]>
    }>
    type ServerIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ServerActions>
  }
}
