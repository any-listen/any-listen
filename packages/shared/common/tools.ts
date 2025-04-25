import { dateFormat, generateIdByPerf } from './utils'

export const getMusicInfo = (musicInfo: AnyListen.Download.ListItem | AnyListen.Music.MusicInfo) => {
  return 'progress' in musicInfo ? musicInfo.metadata.musicInfo : musicInfo
}

export const createPlayMusicInfo = ({
  musicInfo,
  listId,
  isOnline,
  playLater,
  played = false,
  linked = false,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  listId: string
  isOnline: boolean
  playLater: boolean
  played?: boolean
  linked?: boolean
}): AnyListen.Player.PlayMusicInfo => ({
  itemId: linked ? `${listId}_${musicInfo.id}` : `${generateIdByPerf()}_${musicInfo.id}`,
  listId,
  isOnline,
  musicInfo,
  played,
  playLater,
})

export const createPlayMusicInfoList = ({
  musicInfos,
  listId,
  isOnline,
  playLater,
  played = false,
  linked = false,
}: {
  musicInfos: AnyListen.Music.MusicInfo[]
  listId: string
  isOnline: boolean
  playLater: boolean
  played?: boolean
  linked?: boolean
}) => {
  return musicInfos.map((m) =>
    createPlayMusicInfo({
      musicInfo: m,
      listId,
      playLater,
      isOnline,
      linked,
      played,
    })
  )
}

export const buildMusicName = (setting: AnyListen.AppSetting['download.fileName'], name: string, singer: string) =>
  singer ? setting.replace('%name%', name).replace('%singer%', singer) : name
export const buildSourceLabel = (musicinfo: AnyListen.Music.MusicInfo) => {
  if (musicinfo.isLocal) {
    switch (musicinfo.meta.ext) {
      case 'flac':
      case 'wav':
        return musicinfo.meta.bitrateLabel == '16bit'
          ? musicinfo.meta.ext.toUpperCase()
          : `${musicinfo.meta.ext.toUpperCase()} ${musicinfo.meta.bitrateLabel}`
      default:
        return musicinfo.meta.bitrateLabel?.toUpperCase() ?? ''
    }
  }
  return musicinfo.meta.source
}

export const logFormat = (log: AnyListen.LogInfo) => {
  return `${dateFormat(log.timestamp)} ${log.type.toUpperCase()} ${log.message}`
}

export const buildMusicCacheId = (musicInfo: AnyListen.Music.MusicInfo, quality: AnyListen.Music.Quality) => {
  return `${musicInfo.id}_${quality}`
}
export const getFileType = (quality: AnyListen.Music.Quality): AnyListen.Music.FileType => {
  switch (quality) {
    case '128k':
    case '192k':
    case '320k':
      return 'mp3'
    case 'wav':
      return 'wav'
    case 'flac':
    case 'flac24bit':
    case 'dobly':
    case 'master':
      return 'flac'
  }
}

const existTimeExp = /\[\d{1,2}:.*\d{1,4}\]/
/**
 * 是否有效的 lyric
 * @param lrc
 */
export const isValidLyric = (lrc?: string | null | number) => typeof lrc == 'string' && existTimeExp.test(lrc)

export const getLatestVersion = (info: AnyListen.UpdateInfo, allowPreRelease = false) => {
  const latest = { version: info.version, desc: info.desc, time: info.time }
  if (!allowPreRelease || !info.beta) return latest
  return info.beta[0]
}
