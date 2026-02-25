import { getLocalFilePath } from '@any-listen/app/modules/music/utils'
import { writeProxyCache } from '@any-listen/app/modules/proxyServer'

import { encodePath } from '@/shared/electron'
import { workers } from '@/worker'

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
    const path = await getLocalFilePath(musicInfo)
    if (path) {
      return {
        url: encodePath(path),
        // toggleSource: false,
        // quality: (musicInfo.meta.bitrateLabel as AnyListen.Music.Quality | null) ?? '128k',
        quality: '128k',
        isFromCache: false,
      }
    }
  }
  return null
}

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
    let pic = await workers.utilService.getMusicFilePic(musicInfo.meta.filePath)
    if (pic) {
      if (typeof pic == 'string') {
        return {
          url: pic,
          isFromCache: true,
          // toggleSource: false,
        }
      }
      return {
        url: await writeProxyCache(`${musicInfo.meta.filePath}.${pic.format}`, pic.data),
        isFromCache: false,
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
        info: await buildLyricInfo({
          ...fileLyricInfo,
          name: musicInfo.name,
          singer: musicInfo.singer,
          interval: musicInfo.interval,
        }),
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
