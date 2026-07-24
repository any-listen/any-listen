import { getLocalFilePath } from '@any-listen/app/modules/music/utils'
import { writeProxyCache } from '@any-listen/app/modules/proxyServer'
import { verifyResourceBoolean } from '@any-listen/nodejs/request'

import { appState } from '@/app'
import { encodePath } from '@/shared/utils'
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
  if (musicInfo.meta.deviceId !== appState.machineId) return null
  if (!isRefresh) {
    const path = await getLocalFilePath(musicInfo)
    if (path) {
      let url: string
      if (path.endsWith('.strm')) {
        const strmUrl = await workers.utilService.getStrmFileUrl(path)
        if (strmUrl) url = strmUrl
        else return null
      } else {
        url = encodePath(path)
      }
      return {
        url,
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
}: {
  musicInfo: AnyListen.Music.MusicInfoLocal
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicPicInfo | null> => {
  if (musicInfo.meta.deviceId !== appState.machineId) return null
  if (isRefresh && (!musicInfo.meta.picUrl || !(await verifyResourceBoolean(musicInfo.meta.picUrl)))) {
    isRefresh = false
  }
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
  if (musicInfo.meta.deviceId !== appState.machineId) return null
  if (!isRefresh) {
    const [lyricInfo, fileLyricInfo] = await Promise.all([
      getCachedLyricInfo(musicInfo),
      appState.appSetting['player.ignoreLocalLyrics']
        ? Promise.resolve(null)
        : workers.utilService.getMusicFileLyric(musicInfo.meta.filePath),
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
