import { QUALITYS, SINGERS_RXP } from './constants'
import { dateFormat, generateIdByPerf } from './utils'

export const getMusicInfo = (musicInfo: AnyListen.Download.ListItem | AnyListen.Music.MusicInfo) => {
  return 'progress' in musicInfo ? musicInfo.metadata.musicInfo : musicInfo
}

export const createPlayMusicInfo = ({
  musicInfo,
  listId,
  source,
  playLater,
  played = false,
  linked = false,
}: {
  musicInfo: AnyListen.Music.MusicInfo
  listId: string
  source: AnyListen.Player.SourceType
  playLater: boolean
  played?: boolean
  linked?: boolean
}): AnyListen.Player.PlayMusicInfo => ({
  itemId: linked ? `${listId}_${musicInfo.id}` : `${generateIdByPerf()}_${musicInfo.id}`,
  listId,
  source,
  musicInfo,
  played,
  playLater,
})

export const createPlayMusicInfoList = ({
  musicInfos,
  listId,
  source,
  playLater,
  played = false,
  linked = false,
}: {
  musicInfos: AnyListen.Music.MusicInfo[]
  listId: string
  source: AnyListen.Player.SourceType
  playLater: boolean
  played?: boolean
  linked?: boolean
}) => {
  return musicInfos.map((m) =>
    createPlayMusicInfo({
      musicInfo: m,
      listId,
      playLater,
      source,
      linked,
      played,
    })
  )
}

export const buildMusicName = (setting: AnyListen.AppSetting['download.fileName'], name: string, singer: string) => {
  return singer ? setting.replace('%name%', name).replace('%singer%', singer) : name
}

const labelMap: Record<AnyListen.Music.Quality, string> = {
  master: 'MASTER',
  dolby: 'ATMOS',
  flac24bit: 'HR',
  flac: 'SQ',
  wav: 'WAV',
  '320k': '320K',
  '192k': '192K',
  '128k': '128K',
}
const QUALITYS_REV = [...QUALITYS].reverse()

const getFileLabel = (ext?: string, bitrateLabel?: string | null) => {
  let label: string | undefined
  switch (ext) {
    case 'flac':
    case 'wav': {
      switch (bitrateLabel) {
        case '16bit':
          label = labelMap[ext]
          break
        case '24bit':
          label = labelMap.flac24bit
          break
        default:
          if (bitrateLabel) label = labelMap.flac24bit
          else label = labelMap[ext]
          break
      }
      break
    }
    default: {
      if (bitrateLabel) {
        label = labelMap[bitrateLabel.toLowerCase() as AnyListen.Music.Quality]
        label ||= bitrateLabel.toUpperCase()
      }
      break
    }
  }
  return label
}
export const buildSourceLabel = (musicinfo: AnyListen.Music.MusicInfo): string[] => {
  if (musicinfo.isLocal) {
    const labels = ['local']
    const label = getFileLabel(musicinfo.meta.ext, musicinfo.meta.bitrateLabel)
    if (label) labels.push(label)
    return labels
  }
  const quality = QUALITYS_REV.find((q) => !!musicinfo.meta.qualitys?.[q])
  let label: string | undefined
  if (quality) label = labelMap[quality]
  if (!label && (musicinfo.meta.ext || musicinfo.meta.bitrateLabel)) {
    label = getFileLabel(musicinfo.meta.ext, musicinfo.meta.bitrateLabel)
  }
  return [musicinfo.meta.source.toLowerCase(), label ?? ''].filter((s) => s)
}

export const logFormat = (log: AnyListen.LogInfo | AnyListen.Extension.LogInfo) => {
  return `${dateFormat(log.timestamp)} ${log.type.toUpperCase()} ${log.message}`
}

export const buildMusicCacheId = (musicInfo: AnyListen.Music.MusicInfo, quality: string) => {
  return `${musicInfo.id}_${quality}`
}
export const getFileType = (quality: string): AnyListen.Music.FileType => {
  switch (quality) {
    case '128k':
    case '192k':
    case '320k':
      return 'mp3'
    case 'wav':
      return 'wav'
    case 'flac':
    case 'flac24bit':
    case 'dolby':
    case 'master':
      return 'flac'
  }
  return 'mp3'
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

/**
 * 格式化扩展商店 github 镜像地址
 * @param hosts
 * @returns
 */
export const formatExtensionGHMirrorHosts = (hosts: string[]) => {
  return Array.from(
    new Set(
      hosts
        .map((v) => {
          v = v.trim().replace(/\/$/, '') // Remove trailing slashes
          if (!v) return ''
          if (v.startsWith('#') || v.includes(' ')) return ''
          if (v.startsWith('http://') || v.startsWith('https://')) {
            return v
          }
          return ''
        })
        .filter((v) => v !== '')
    )
  )
}

/**
 * 歌手名称格式化
 * @param name 歌手名称，可能包含多个歌手，用 / ; , 等分隔
 * @returns
 */
export const singerFormat = (name: string) => {
  if (!name) return ''
  return SINGERS_RXP.test(name)
    ? name
        .split(SINGERS_RXP)
        .map((s) => s.trim())
        .filter((s) => s)
        .join('、')
    : name || ''
}

export const VIRTUAL_PROTOCOL = 'al-ps-host:'
export const buildVirtualPublicPath = (basePath: string, name: string) => {
  // if (basePath.startsWith('/') ? '.')
  return `${basePath.startsWith('/') ? VIRTUAL_PROTOCOL : ''}${basePath}/${name}`
}
export const buildRealPublicPath = (virtualPath: string, host: string) => {
  if (!virtualPath.startsWith(VIRTUAL_PROTOCOL)) return virtualPath
  return virtualPath.replace(VIRTUAL_PROTOCOL, host)
}

export const deduplicationList = <T extends AnyListen.Music.MusicInfo>(list: T[]): T[] => {
  const ids = new Set<string>()
  return list.filter((s) => {
    if (ids.has(s.id)) return false
    ids.add(s.id)
    return true
  })
}

export interface ResourceType {
  id: string
  name: string
  extensionId: string
}
export const getSourceId = <T extends ResourceType | undefined | null>(source: T) => {
  return (source ? `${source.extensionId}_${source.id}` : undefined) as T extends ResourceType ? `${string}_${string}` : undefined
}

export const buildUserListInfoFull = <
  T extends AnyListen.List.MyDefaultListInfoFull | AnyListen.List.MyLoveListInfoFull | AnyListen.List.UserListInfoFull,
>(
  info: T
): T => {
  const newInfo = {
    id: info.id,
    name: info.name,
    type: info.type,
    meta: info.meta,
    parentId: info.parentId,
    list: info.list,
  }
  return newInfo as T
}

export const buildListDataFull = (data: AnyListen.List.ListDataFull): AnyListen.List.ListDataFull => {
  const lists = {
    defaultList: buildUserListInfoFull(data.defaultList),
    loveList: buildUserListInfoFull(data.loveList),
    userList: data.userList.map((list) => buildUserListInfoFull(list)),
  }
  return lists
}
