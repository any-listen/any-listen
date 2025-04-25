// if (targetSong.key) { // 如果是已下载的歌曲
//   const filePath = path.join(appSetting['download.savePath'], targetSong.metadata.fileName)
//   // console.log(filePath)

// import {
//   getMusicUrl as getOnlineMusicUrl,
//   getPicUrl as getOnlinePicUrl,
//   getLyricInfo as getOnlineLyricInfo,
// } from '@any-listen/app/modules/music/online'
// import {
//   getMusicUrl as getDownloadMusicUrl,
//   getPicUrl as getDownloadPicUrl,
//   getLyricInfo as getDownloadLyricInfo,
// } from './download'
import { getLyricInfo as getLocalLyric, getMusicUrl as getLocalMusicUrl, getMusicPicUrl as getLocalPicUrl } from './local'
import { getLyricInfo as getOnlineLyric, getMusicUrl as getOnlineMusicUrl, getMusicPicUrl as getOnlinePicUrl } from './online'

export const getMusicUrl = async ({
  musicInfo,
  quality,
  isRefresh = false,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  isRefresh?: boolean
  quality?: AnyListen.Music.Quality
}): Promise<AnyListen.IPCMusic.MusicUrlInfo> => {
  if (musicInfo.isLocal) {
    const info = await getLocalMusicUrl({
      musicInfo,
      isRefresh,
      quality,
    })
    if (info) return info
    // return getLocalMusicUrl({ musicInfo, isRefresh })
  } else {
    // return getOnlineMusicUrl({ musicInfo, isRefresh, quality })
  }
  return getOnlineMusicUrl({ musicInfo, isRefresh, quality })
  // if ('progress' in musicInfo) {
  //   return getDownloadMusicUrl({ musicInfo, isRefresh })
  // } else if (musicInfo.source == 'local') {
  //   return getLocalMusicUrl({ musicInfo, isRefresh })
  // } else {
  //   return getOnlineMusicUrl({ musicInfo, isRefresh, quality })
  // }
}

export const getMusicPic = async ({
  musicInfo,
  isRefresh = false,
  listId,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  listId?: string | null
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicPicInfo> => {
  if (musicInfo.isLocal) {
    const info = await getLocalPicUrl({
      musicInfo,
      isRefresh,
      listId,
    })
    if (info) return info
    // return getLocalPicUrl({ musicInfo, isRefresh, listId })
  } else {
    // return getOnlinePicUrl({ musicInfo, isRefresh, listId })
  }
  return getOnlinePicUrl({ musicInfo, isRefresh, listId })

  // if ('progress' in musicInfo) {
  //   return getDownloadPicUrl({ musicInfo, isRefresh, listId })
  // } else if (musicInfo.source == 'local') {
  //   return getLocalPicUrl({ musicInfo, isRefresh, listId })
  // } else {
  //   return getOnlinePicUrl({ musicInfo, isRefresh, listId })
  // }
}

export const getLyricInfo = async ({
  musicInfo,
  isRefresh = false,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  isRefresh?: boolean
}): Promise<AnyListen.IPCMusic.MusicLyricInfo> => {
  if (musicInfo.isLocal) {
    const info = await getLocalLyric({
      musicInfo,
      isRefresh,
    })
    if (info) return info
    // return getLocalLyricInfo({ musicInfo, isRefresh })
  } else {
    // return getOnlineLyricInfo({ musicInfo, isRefresh })
  }
  return getOnlineLyric({ musicInfo, isRefresh })
  // if ('progress' in musicInfo) {
  //   return getDownloadLyricInfo({ musicInfo, isRefresh })
  // } else if (musicInfo.source == 'local') {
  //   return getLocalLyricInfo({ musicInfo, isRefresh })
  // } else {
  //   return getOnlineLyricInfo({ musicInfo, isRefresh })
  // }
}
