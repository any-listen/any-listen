declare namespace AnyListen {
  namespace Music {
    type Source = string
    type Quality = '128k' | '320k' | 'flac' | 'flac24bit' | '192k' | 'wav' | 'dobly' | 'master'
    type FileType = 'mp3' | 'flac' | 'wav' | 'm4a'

    type MusicQualityType = Partial<
      Record<
        Quality,
        {
          sizeStr: string | null
          [key: string]: string | null
        }
      >
    >

    interface MusicInfoMetaBase {
      musicId: string // 歌曲ID
      albumName: string // 歌曲专辑名称
      year?: number // 歌曲年份
      picUrl?: string | null // 歌曲图片链接
      createTime: number
      updateTime: number
      posTime: number
      /** Whether the metadata has been parsed */
      unparsed?: boolean
    }

    interface MusicInfoMeta_online extends MusicInfoMetaBase {
      source: Source // 源
      qualitys?: MusicQualityType
      fileName?: string
      ext?: string
      bitrateLabel?: string | null
      sizeStr?: string
      [key: string]: string | number | boolean | null | undefined | object
    }

    interface MusicInfoMeta_local extends MusicInfoMetaBase {
      filePath: string
      ext: string
      bitrateLabel: string | null
      sizeStr: string
    }

    interface MusicInfoBase<IsLocal extends boolean> {
      id: string
      name: string // 歌曲名
      singer: string // 艺术家名
      interval: string | null // 格式化后的歌曲时长，例：03:55
      isLocal: IsLocal
      meta: MusicInfoMetaBase
    }

    interface MusicInfoLocal extends MusicInfoBase<true> {
      meta: MusicInfoMeta_local
    }

    interface MusicInfoOnline extends MusicInfoBase<false> {
      meta: MusicInfoMeta_online
    }

    type MusicInfo = MusicInfoLocal | MusicInfoOnline

    interface LyricInfo {
      // 歌曲歌词
      lyric: string
      // 翻译歌词
      tlyric?: string | null
      // 罗马音歌词
      rlyric?: string | null
      // 逐字歌词
      awlyric?: string | null
      name: string
      singer: string
      interval: string | null

      rawlrcInfo?: {
        // 歌曲歌词
        lyric: string
        // 翻译歌词
        tlyric?: string | null
        // 罗马音歌词
        rlyric?: string | null
        // 逐字歌词
        awlyric?: string | null
      }
    }

    // interface LyricInfoSave {
    //   id: string
    //   lyrics: LyricInfo
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
  }
}
