import { checkAllowPath, createMediaPublicPath, createPicFilePublicPath, createPicPublicPath } from '@/app/modules/fileSystem'
import { workers } from '@/app/worker'
import { getLocalFilePath } from '@any-listen/app/modules/music/utils'
import { buildLyricInfo, getCachedLyricInfo } from './shared'

export const getMusicUrl = async ({
  musicInfo,
  quality,
  isRefresh = false,
}: {
  musicInfo: AnyListen.Music.MusicInfoLocal
  isRefresh?: boolean
  quality?: string
}): Promise<AnyListen.IPCMusic.MusicUrlInfo | null> => {
  if (!isRefresh) {
    const filePath = await getLocalFilePath(musicInfo)
    if (filePath) {
      if (import.meta.env.DEV) {
        const url = await createMediaPublicPath(filePath)
        if (url) {
          return {
            url,
            // toggleSource: false,
            quality: '128k',
            isFromCache: false,
          }
        }
      } else {
        if (checkAllowPath(filePath)) {
          const url = await createMediaPublicPath(filePath)
          if (url) {
            return {
              url,
              // toggleSource: false,
              quality: '128k',
              // quality: (musicInfo.meta.bitrateLabel as AnyListen.Music.Quality | null) ?? '128k',
              isFromCache: false,
            }
          }
        }
      }
    }
  }
  return null
}

const httpRxp = /^https?:/
export const getMusicPicUrl = async ({
  musicInfo,
  isRefresh = false,
  listId,
}: {
  musicInfo: AnyListen.Music.MusicInfoLocal
  listId?: string | null
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicPicInfo | null> => {
  if (!isRefresh) {
    const pic = await workers.utilService.getMusicFilePic(musicInfo.meta.filePath)
    if (pic) {
      if (typeof pic == 'string') {
        if (httpRxp.test(pic)) {
          return {
            url: pic,
            isFromCache: true,
            // toggleSource: false,
          }
        }
        let url = await createPicPublicPath(musicInfo.meta.filePath, pic)
        if (url) {
          return {
            url,
            isFromCache: false,
            // toggleSource: false,
          }
        }
      } else {
        let url = await createPicFilePublicPath(musicInfo.meta.filePath, pic.format, pic.data)
        if (url) {
          return {
            url,
            isFromCache: false,
            // toggleSource: false,
          }
        }
      }
    }

    if (musicInfo.meta.picUrl) {
      return {
        url: musicInfo.meta.picUrl,
        isFromCache: true,
        // toggleSource: false,
      }
    }
  }
  return null
}

export const getLyricInfo = async ({
  musicInfo,
  isRefresh = false,
}: {
  musicInfo: AnyListen.Music.MusicInfoLocal
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicLyricInfo | null> => {
  if (!isRefresh) {
    const [lyricInfo, fileLyricInfo] = await Promise.all([
      getCachedLyricInfo(musicInfo),
      workers.utilService.getMusicFileLyric(musicInfo.meta.filePath),
    ])
    if (lyricInfo?.lyric && lyricInfo.rawlrcInfo) {
      // 存在已编辑歌词
      return {
        info: await buildLyricInfo({ ...lyricInfo, rawlrcInfo: fileLyricInfo ?? lyricInfo.rawlrcInfo }),
        isFromCache: true,
      }
    }

    if (fileLyricInfo) {
      return {
        info: await buildLyricInfo(fileLyricInfo),
        isFromCache: true,
      }
    }
    if (lyricInfo?.lyric) {
      return {
        info: await buildLyricInfo(lyricInfo),
        isFromCache: true,
      }
    }
  }
  return null
}
