import { updateMusicPic } from '@any-listen/app/modules/musicList'
import { buildMusicCacheId, getFileType } from '@any-listen/common/tools'

import { appState } from '@/app/app'
import { workers } from '@/app/worker'

import {
  getMusicLyricByExtensionSource,
  getMusicLyric as getMusicLyricResource,
  getMusicPicByExtensionSource,
  getMusicPic as getMusicPicResource,
  getMusicUrlByExtensionSource,
  getMusicUrl as getMusicUrlResource,
} from '../resources'
import { buildLyricInfo, getCachedLyricInfo, saveLyricInfo } from './shared'

export const getMusicUrlByExtSource = async ({
  musicInfo,
  quality,
  isRefresh = false,
  extensionId,
  source,
}: {
  musicInfo: AnyListen.Music.MusicInfoOnline
  extensionId: string
  source: string
  isRefresh?: boolean
  quality?: string
}): Promise<AnyListen.IPCMusic.MusicUrlInfo> => {
  const targetQuality = quality ?? appState.appSetting['player.playQuality']
  const cachedUrl = await workers.dbService.getMusicUrl(buildMusicCacheId(musicInfo, targetQuality))
  if (cachedUrl && !isRefresh) return { isFromCache: true, quality: targetQuality, url: cachedUrl }
  const info = await getMusicUrlByExtensionSource({
    musicInfo,
    quality: targetQuality,
    type: getFileType(targetQuality),
    extensionId,
    source,
  })
  return {
    quality: info.quality,
    url: info.url,
    isFromCache: false,
  }
}

export const getMusicUrl = async ({
  musicInfo,
  quality,
  isRefresh = false,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  isRefresh?: boolean
  quality?: string
}): Promise<AnyListen.IPCMusic.MusicUrlInfo> => {
  const targetQuality = quality ?? appState.appSetting['player.playQuality']
  const id = buildMusicCacheId(musicInfo, targetQuality)
  const cachedUrl = await workers.dbService.getMusicUrl(id)
  if (cachedUrl && !isRefresh) return { isFromCache: true, quality: targetQuality, url: cachedUrl }
  const info = await getMusicUrlResource({
    musicInfo,
    quality: targetQuality,
    type: getFileType(targetQuality),
  })
  void workers.dbService.musicUrlSave([{ id, url: info.url }])
  return {
    quality: info.quality,
    url: info.url,
    isFromCache: false,
  }
}

export const getMusicPicByExtSource = async ({
  musicInfo,
  isRefresh = false,
  extensionId,
  source,
}: {
  musicInfo: AnyListen.Music.MusicInfoOnline
  extensionId: string
  source: string
  isRefresh?: boolean
  quality?: string
}): Promise<AnyListen.IPCMusic.MusicPicInfo> => {
  if (musicInfo.meta.picUrl && !isRefresh) {
    return {
      isFromCache: true,
      url: musicInfo.meta.picUrl,
    }
  }
  const url = await getMusicPicByExtensionSource({
    musicInfo,
    extensionId,
    source,
  })
  return {
    url,
    isFromCache: false,
  }
}
export const getMusicPicUrl = async ({
  musicInfo,
  isRefresh = false,
  listId,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  listId?: string | null
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicPicInfo> => {
  if (musicInfo.meta.picUrl && !isRefresh) {
    return {
      isFromCache: true,
      url: musicInfo.meta.picUrl,
    }
  }
  const url = await getMusicPicResource({ musicInfo })
  if (listId) {
    musicInfo.meta.picUrl = url
    void updateMusicPic(listId, musicInfo)
  }
  return {
    url,
    isFromCache: false,
  }
}

export const getLyricInfoByExtSource = async ({
  musicInfo,
  isRefresh = false,
  extensionId,
  source,
}: {
  musicInfo: AnyListen.Music.MusicInfoOnline
  extensionId: string
  source: string
  isRefresh?: boolean
  quality?: string
}): Promise<AnyListen.IPCMusic.MusicLyricInfo> => {
  if (!isRefresh) {
    const lyricInfo = await getCachedLyricInfo(musicInfo)
    if (lyricInfo) return { info: await buildLyricInfo(lyricInfo), isFromCache: false }
  }
  const info = await getMusicLyricByExtensionSource({
    musicInfo,
    extensionId,
    source,
  })
  void saveLyricInfo(musicInfo, info)
  return {
    info,
    isFromCache: false,
  }
}
export const getLyricInfo = async ({
  musicInfo,
  isRefresh = false,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  listId?: string | null
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicLyricInfo> => {
  if (!isRefresh) {
    const lyricInfo = await getCachedLyricInfo(musicInfo)
    if (lyricInfo) return { info: await buildLyricInfo(lyricInfo), isFromCache: false }
  }
  const info = await getMusicLyricResource({ musicInfo })
  void saveLyricInfo(musicInfo, info)
  return {
    info,
    isFromCache: false,
  }
}
