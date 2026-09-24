/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { QUALITYS } from '@any-listen/common/constants'
import { VIRTUAL_PROTOCOL } from '@any-listen/common/tools'

import type { ListCommonResult } from '@/types/api'

import { console } from './global'

let actions: Partial<AnyListen.IPCExtension.ResourceAction>
export const registerResourceAction = (_actions: Partial<AnyListen_API.ResourceAction>) => {
  actions = _actions
}

const qualityFilter = (qualitys: AnyListen.Music.MusicInfoOnline['meta']['qualitys']) => {
  return Object.fromEntries(
    (Object.entries(qualitys ?? {}) as EntriesObject<NonNullable<typeof qualitys>>)
      .filter(([quality]) => QUALITYS.includes(quality))
      .map(([key, data]) => {
        const dataArr = Object.entries(data!)
        if (dataArr.length > 20) {
          throw new Error(withErrorReason('quality type data too much', data, `key=${key}; length=${dataArr.length}`))
        }
        for (const [key, value] of dataArr) {
          if (typeof key != 'string' || key.length > 64) {
            throw new Error(withErrorReason('quality type key no match', key, `length=${key.length}`))
          }
          if (typeof value == 'string') {
            if (value.length > 2048) {
              throw new Error(withErrorReason('quality type value no match', value, `length=${value.length}`))
            }
          } else if (value != null) {
            throw new Error(withErrorReason('quality type value no match', value))
          }
        }
        return [key, data]
      })
  )
}
const substrLength = (str: string, length = 256): string => {
  return str.length > length ? str.substring(0, length) : str
}
/**
 * 获取值的可读类型描述。
 *
 * @param value 需要描述类型的任意值。
 * @returns 统一后的类型字符串，例如 `string`、`number`、`null`、`array`、`object`。
 */
const getValueType = (value: unknown): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}
/**
 * 将任意值格式化为适合拼接到错误信息中的字符串。
 *
 * @param value 需要输出到错误信息中的值。
 * @param length 输出的最大长度，超出会被截断，默认 256。
 * @returns 适合日志/报错展示的字符串值。
 *
 * 用法：
 * 用于错误信息里输出实际值，例如 `value=xxx`。
 */
const formatErrorValue = (value: unknown, length = 256): string => {
  if (typeof value == 'string') return substrLength(value, length)
  if (typeof value == 'number' || typeof value == 'boolean' || typeof value == 'bigint') return String(value)
  if (typeof value == 'undefined') return 'undefined'
  if (typeof value == 'symbol') return String(value)
  if (typeof value == 'function') return `[function ${value.name || 'anonymous'}]`
  try {
    return substrLength(JSON.stringify(value), length)
  } catch {
    return Object.prototype.toString.call(value)
  }
}
/**
 * 生成统一格式的错误消息，自动追加值的类型、内容以及额外上下文。
 *
 * @param message 错误主信息，描述“为什么错”。
 * @param value 触发错误的原始值，会自动补充 type 和 value。
 * @param extra 可选的附加上下文，例如 index、length、expected 等。
 * @returns 可直接传给 Error 的完整错误文本。
 *
 * 用法：
 * ```
 * throw new Error(withErrorReason('music url is not a valid url', url))
 * throw new Error(withErrorReason('song item is null', item, `index=${index}`))
 * ```
 */
const withErrorReason = (message: string, value: unknown, extra?: string): string => {
  const reason = `type=${getValueType(value)} value=${formatErrorValue(value)}`
  return extra ? `${message}: ${extra}; ${reason}` : `${message}: ${reason}`
}
const toSafeString = (value: unknown, name: string, length = 256): string => {
  switch (typeof value) {
    case 'string':
      return substrLength(value, length)
    case 'number':
    case 'boolean':
    case 'bigint':
      return substrLength(String(value), length)
    default:
      throw new Error(withErrorReason(`${name} is not a string`, value))
  }
}
const getRequiredString = (value: unknown, name: string, length = 256): string => {
  if (value == null) throw new Error(withErrorReason(`${name} is null`, value))
  const str = toSafeString(value, name, length)
  if (!str.trim()) throw new Error(withErrorReason(`${name} is empty`, value))
  return str
}
const getOptionalString = (value: unknown, length = 256): string | undefined => {
  if (value == null) return undefined
  return toSafeString(value, 'value', length)
}
const getOptionalStringOrNull = (value: unknown, length = 256): string | null | undefined => {
  if (value === null) return null
  if (value == null) return undefined
  return toSafeString(value, 'value', length)
}
const getOptionalInt = (value: unknown, min = 0): number | undefined => {
  if (value == null) return undefined
  if (typeof value != 'number' || !Number.isFinite(value) || value < min) return undefined
  return Math.trunc(value)
}
const verifyArray = <T>(list: T[], name: string, verifyItem: (item: T, index: number) => void): T[] => {
  if (!Array.isArray(list)) throw new Error(withErrorReason(`${name} result is not an array`, list))
  for (let i = list.length - 1; i >= 0; i--) {
    try {
      verifyItem(list[i], i)
    } catch (e) {
      console.warn(`verify ${name} array item error`, (e as Error).message)
      list.splice(i, 1)
    }
  }
  return list
}
const verifyStringArray = (arr: string[], name: string): string[] => {
  if (!Array.isArray(arr)) throw new Error(withErrorReason(`${name} result is not an array`, arr))
  return arr
    .filter((s) => {
      if (typeof s !== 'string') throw new Error(withErrorReason(`${name} result is not a string`, s))
      return !!s.trim()
    })
    .map((s) => substrLength(String(s)))
}
export const verifyOnlineMusicArray = (
  list: AnyListen.Music.MusicInfoOnline[],
  name: string,
  source: string
): AnyListen.Music.MusicInfoOnline[] => {
  if (!Array.isArray(list)) throw new Error(withErrorReason(`${name} result is not an array`, list))
  for (let i = list.length - 1; i >= 0; i--) {
    const musicInfo = list[i]
    try {
      if (!musicInfo) throw new Error(withErrorReason(`${name} result contains null item`, musicInfo, `index=${i}`))
      const id = getRequiredString(musicInfo.id, `${name} result.id`)
      const _name = getRequiredString(musicInfo.name, `${name} result.name`)
      const singer = getOptionalString(musicInfo.singer) ?? ''
      let interval: string | null
      if (musicInfo.interval && typeof musicInfo.interval == 'string' && musicInfo.interval.includes(':')) {
        interval = substrLength(musicInfo.interval)
      } else {
        interval = null
      }

      if (!musicInfo.meta) throw new Error(withErrorReason(`${name} result.meta is null`, musicInfo.meta, `index=${i}`))
      const meta = { ...musicInfo.meta }
      meta.albumName = getOptionalString(meta.albumName) ?? ''
      meta.createTime = 0
      meta.posTime = 0
      meta.updateTime = 0
      meta.musicId = getOptionalString(meta.musicId) ?? ''
      meta.picUrl = getOptionalStringOrNull(meta.picUrl, 2048)
      if (typeof meta.year != 'number' || meta.year > 10000000 || meta.year < 1) {
        delete meta.year
      } else {
        meta.year = Math.trunc(meta.year)
      }
      if (!meta.qualitys) throw new Error(withErrorReason(`${name} result.meta.qualitys is null`, meta.qualitys, `index=${i}`))
      meta.qualitys = qualityFilter(meta.qualitys)
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      if (meta.filePath != null) meta.filePath = substrLength(String(meta.filePath), 2048)
      if (meta.bitrateLabel != null) meta.bitrateLabel = substrLength(String(meta.bitrateLabel), 50)
      if (meta.sizeStr != null) meta.sizeStr = substrLength(String(meta.sizeStr), 50)
      if (meta.ext != null) meta.ext = substrLength(String(meta.ext), 50)
      meta.source = source

      list[i] = {
        id,
        name: _name,
        singer,
        interval,
        isLocal: false,
        meta,
      }
    } catch (e) {
      console.warn(`verify ${name} array item error`, (e as Error).message)
      list.splice(i, 1)
    }
  }
  return list
}
const verifyListCommonResult = <T>(result: ListCommonResult<T>, name: string): ListCommonResult<T> => {
  if (!result) throw new Error(withErrorReason(`${name} result is null`, result))
  if (!Array.isArray(result.list)) throw new Error(withErrorReason(`${name} result.list is not an array`, result.list))
  if (typeof result.total != 'number') throw new Error(withErrorReason(`${name} result.total is not a number`, result.total))
  if (typeof result.page != 'number') throw new Error(withErrorReason(`${name} result.page is not a number`, result.page))
  if (typeof result.limit != 'number') throw new Error(withErrorReason(`${name} result.limit is not a number`, result.limit))
  return result
}
const urlRxp = /^(?:(?:https?|file):\/\/\S+|(?:\.{0,2})\/(?!\/)\S*)$/
const proxyUrlRxp = new RegExp(`^${VIRTUAL_PROTOCOL}`)
const verifyUrl = (url: string, name: string) => {
  if (typeof url != 'string') throw new Error(withErrorReason(`${name} url result is not a string`, url))
  if (url.length > 2048) throw new Error(withErrorReason(`${name} url is too long`, url, `length=${url.length}`))
  if (!urlRxp.test(url) && !proxyUrlRxp.test(url)) throw new Error(withErrorReason(`${name} url is not a valid url`, url))
}
const verifyQuality = (quality: string) => {
  if (typeof quality != 'string') throw new Error(withErrorReason('quality is not a string', quality))
  if (!QUALITYS.includes(quality as AnyListen.Music.Quality)) {
    throw new Error(withErrorReason('quality is not a valid quality', quality, `expected one of ${QUALITYS.join(', ')}`))
  }
}
const verifyTipSearchAction = (result: string[]): string[] => {
  return verifyStringArray(result, 'tip search')
}
const verifyHotSearchAction = (result: string[]): string[] => {
  if (!Array.isArray(result)) throw new Error(withErrorReason('hot search result is not an array', result))
  return result.filter((s) => s != null).map((s) => String(s))
}
const verifyMusicSearchAction = (
  result: ListCommonResult<AnyListen.Music.MusicInfoOnline>,
  source: string
): ListCommonResult<AnyListen.Music.MusicInfoOnline> => {
  verifyListCommonResult(result, 'music search')
  verifyOnlineMusicArray(result.list, 'music search', source)
  return result
}
const verifyMusicPicAction = <T extends string | string[]>(result: T): T => {
  if (Array.isArray(result)) {
    for (const url of result) {
      verifyUrl(url, 'music pic')
    }
  } else {
    verifyUrl(result, 'music pic')
  }
  return result
}
const verifyMusicUrlAction = (result: AnyListen.IPCExtension.MusicUrlInfo): AnyListen.IPCExtension.MusicUrlInfo => {
  verifyUrl(result.url, 'music')
  verifyQuality(result.quality)
  return result
}
const verifyLyricInfo = (result: AnyListen.Music.LyricInfo, name: string): AnyListen.Music.LyricInfo => {
  if (!result) throw new Error(withErrorReason(`${name} result is null`, result))
  const lyric = getRequiredString(result.lyric, `${name} lyric`, 1024 * 1024)
  const lyricName = getOptionalString(result.name) ?? ''
  const singer = getOptionalString(result.singer) ?? ''
  let interval: string | null
  if (!result.interval || typeof result.interval != 'string' || !result.interval.includes(':')) {
    interval = null
  } else {
    interval = substrLength(result.interval, 32)
  }
  const tlyric = getOptionalStringOrNull(result.tlyric, 1024 * 1024)
  const rlyric = getOptionalStringOrNull(result.rlyric, 1024 * 1024)
  const awlyric = getOptionalStringOrNull(result.awlyric, 1024 * 1024)
  let rawlrcInfo: AnyListen.Music.LyricInfo['rawlrcInfo']
  if (result.rawlrcInfo != null) {
    if (typeof result.rawlrcInfo == 'object') {
      const rawLyric = getOptionalString(result.rawlrcInfo.lyric, 1024 * 1024)
      if (rawLyric) {
        rawlrcInfo = {
          lyric: rawLyric,
          tlyric: getOptionalStringOrNull(result.rawlrcInfo.tlyric, 1024 * 1024),
          rlyric: getOptionalStringOrNull(result.rawlrcInfo.rlyric, 1024 * 1024),
          awlyric: getOptionalStringOrNull(result.rawlrcInfo.awlyric, 1024 * 1024),
        }
      }
    }
  }
  return {
    lyric,
    tlyric,
    rlyric,
    awlyric,
    name: lyricName,
    singer,
    interval,
    rawlrcInfo,
  }
}
const verifyLyricSearchAction = (
  result: AnyListen.IPCExtension.LyricSearchResult[]
): AnyListen.IPCExtension.LyricSearchResult[] => {
  verifyArray(result, 'lyric search', (item, index) => {
    if (!item) throw new Error(withErrorReason('lyric search item is null', item, `index=${index}`))
    const id = getRequiredString(item.id, 'lyric search item id')
    const name = getRequiredString(item.name, 'lyric search item name')
    const artist = getOptionalString(item.artist)
    let interval: number | undefined
    if (item.interval != null) {
      if (typeof item.interval == 'number' && Number.isFinite(item.interval) && item.interval >= 0) {
        interval = Math.trunc(item.interval)
      }
    }
    let lyric: AnyListen.Music.LyricInfo | undefined
    if (item.lyric) {
      try {
        lyric = verifyLyricInfo(item.lyric, 'lyric search item lyric')
      } catch (e) {
        console.warn('verify lyric search item lyric error', (e as Error).message)
        lyric = undefined
      }
    }
    result[index] = {
      id,
      name,
      artist,
      interval,
      lyric,
    }
  })
  return result
}
const verifyLyricAction = (result: AnyListen.Music.LyricInfo): AnyListen.Music.LyricInfo => {
  return verifyLyricInfo(result, 'lyric')
}
const verifySonglistItemArray = (list: AnyListen.Resource.SongListItem[], name: string): AnyListen.Resource.SongListItem[] => {
  return verifyArray(list, name, (item, index) => {
    if (!item) throw new Error(withErrorReason(`${name} item is null`, item, `index=${index}`))
    list[index] = {
      id: getRequiredString(item.id, `${name} item id`),
      name: getRequiredString(item.name, `${name} item name`),
      author: getOptionalString(item.author),
      img: getOptionalString(item.img, 2048),
      play_count: getOptionalString(item.play_count, 64),
      time: getOptionalString(item.time, 64),
      total: getOptionalInt(item.total),
      desc: getOptionalStringOrNull(item.desc, 4096) ?? null,
    }
  })
}
const verifyTagItemArray = (list: AnyListen.Resource.TagItem[], name: string): AnyListen.Resource.TagItem[] => {
  return verifyArray(list, name, (item, index) => {
    if (!item) throw new Error(withErrorReason(`${name} item is null`, item, `index=${index}`))
    list[index] = {
      id: getRequiredString(item.id, `${name} item id`),
      name: getRequiredString(item.name, `${name} item name`),
    }
  })
}
const verifyTagGroupItemArray = (list: AnyListen.Resource.TagGroupItem[], name: string): AnyListen.Resource.TagGroupItem[] => {
  return verifyArray(list, name, (item, index) => {
    if (!item) throw new Error(withErrorReason(`${name} item is null`, item, `index=${index}`))
    list[index] = {
      name: getRequiredString(item.name, `${name} item name`),
      list: verifyTagItemArray(item.list, `${name} item list`),
    }
  })
}
const verifyTopSongsItemArray = (list: AnyListen.Resource.TopSongsItem[], name: string): AnyListen.Resource.TopSongsItem[] => {
  return verifyArray(list, name, (item, index) => {
    if (!item) throw new Error(withErrorReason(`${name} item is null`, item, `index=${index}`))
    list[index] = {
      id: getRequiredString(item.id, `${name} item id`),
      name: getRequiredString(item.name, `${name} item name`),
      pic: getOptionalString(item.pic, 2048),
    }
  })
}
const verifySonglistSearchAction = (
  result: ListCommonResult<AnyListen.Resource.SongListItem>
): ListCommonResult<AnyListen.Resource.SongListItem> => {
  verifyListCommonResult(result, 'songlist search')
  verifySonglistItemArray(result.list, 'songlist search')
  return result
}
const verifySonglistSortsAction = (result: AnyListen.Resource.TagItem[]): AnyListen.Resource.TagItem[] => {
  verifyTagItemArray(result, 'songlist sorts')
  return result
}
const verifySonglistTagsAction = (result: AnyListen.IPCExtension.SonglistTagResult): AnyListen.IPCExtension.SonglistTagResult => {
  if (!result) throw new Error(withErrorReason('songlist tags result is null', result))
  return {
    tags: verifyTagGroupItemArray(Array.isArray(result.tags) ? result.tags : [], 'songlist tags'),
    hotTags: verifyTagItemArray(Array.isArray(result.hotTags) ? result.hotTags : [], 'songlist hot tags'),
  }
}
const verifySonglistAction = (
  result: ListCommonResult<AnyListen.Resource.SongListItem>
): ListCommonResult<AnyListen.Resource.SongListItem> => {
  verifyListCommonResult(result, 'songlist')
  verifySonglistItemArray(result.list, 'songlist')
  return result
}
const verifySonglistDetailInfo = (
  info: AnyListen.Resource.SongListDetailInfo,
  name: string
): AnyListen.Resource.SongListDetailInfo => {
  if (!info) throw new Error(withErrorReason(`${name} is null`, info))
  return {
    name: getRequiredString(info.name, `${name} name`),
    img: getOptionalString(info.img, 2048),
    desc: getOptionalString(info.desc, 4096),
    author: getOptionalString(info.author),
    play_count: getOptionalString(info.play_count, 64),
    date: getOptionalString(info.date, 64),
  }
}
const verifySonglistDetailAction = (
  result: AnyListen.IPCExtension.SonglistDetailResult,
  source: string
): AnyListen.IPCExtension.SonglistDetailResult => {
  verifyListCommonResult(result, 'songlist detail')
  const list = verifyOnlineMusicArray(result.list, 'songlist detail', source)
  const info = verifySonglistDetailInfo(result.info, 'songlist detail info')
  return {
    total: result.total,
    page: result.page,
    limit: result.limit,
    list,
    info,
  }
}
const verifyTopSongsAction = (result: AnyListen.Resource.TopSongsItem[]): AnyListen.Resource.TopSongsItem[] => {
  return verifyTopSongsItemArray(result, 'topSongs')
}
const verifyTopSongsDateAction = (result: AnyListen.Resource.TagItem[], source: string): AnyListen.Resource.TagItem[] => {
  verifyTagItemArray(result, 'topSongs date')
  return result
}
const verifyTopSongsDetailInfo = (
  info: AnyListen.Resource.TopSongsDetailInfo,
  name: string
): AnyListen.Resource.TopSongsDetailInfo => {
  if (!info) throw new Error(withErrorReason(`${name} is null`, info))
  return {
    name: getRequiredString(info.name, `${name} name`),
    pic: getOptionalString(info.pic, 2048),
    desc: getOptionalString(info.desc, 4096),
    date: getOptionalString(info.date, 64),
  }
}
const verifyTopSongsDetailAction = (
  result: AnyListen.IPCExtension.TopSongsDetailResult,
  source: string
): AnyListen.IPCExtension.TopSongsDetailResult => {
  verifyListCommonResult(result, 'topSongs detail')
  const list = verifyOnlineMusicArray(result.list, 'topSongs detail', source)
  const info = verifyTopSongsDetailInfo(result.info, 'topSongs detail info')
  return {
    total: result.total,
    page: result.page,
    limit: result.limit,
    list,
    info,
  }
}
const verifyMusicCommentArray = (
  list: AnyListen.Resource.MusicCommentItem[],
  name: string,
  depth = 0
): AnyListen.Resource.MusicCommentItem[] => {
  return verifyArray(list, name, (item, index) => {
    if (!item) throw new Error(withErrorReason(`${name} item is null`, item, `index=${index}`))
    const id = getRequiredString(item.id, `${name} item id`)
    const userId = getOptionalString(item.userId)
    const userName = getOptionalString(item.userName) || ''
    const text = getRequiredString(item.text, `${name} item text`, 10 * 1024)
    const location = getOptionalString(item.location, 512)

    const time = getOptionalInt(item.time, 0)

    let avatar: string | undefined
    if (item.avatar != null) {
      const avatarValue = getOptionalString(item.avatar, 2048)
      if (avatarValue) {
        try {
          verifyUrl(avatarValue, `${name} item avatar`)
          avatar = avatarValue
        } catch (e) {
          console.warn('verify avatar url error', (e as Error).message)
        }
      }
    }

    let images: string[] | undefined
    if (item.images != null && Array.isArray(item.images)) {
      const imageList = item.images
        .map((img) => getOptionalString(img, 2048))
        .filter((img): img is string => {
          if (!img) return false
          try {
            verifyUrl(img, `${name} item image`)
            return true
          } catch (e) {
            console.warn('verify image url error', (e as Error).message)
            return false
          }
        })
      if (imageList.length) images = imageList
    }

    const likedCount = getOptionalInt(item.likedCount)
    const replyTotal = getOptionalInt(item.replyTotal)

    let skipPage: boolean | undefined
    if (item.skipPage != null && typeof item.skipPage == 'boolean') skipPage = item.skipPage
    let replySkipPage: boolean | undefined
    if (item.replySkipPage != null && typeof item.replySkipPage == 'boolean') replySkipPage = item.replySkipPage

    let reply: AnyListen.Resource.MusicCommentItem[] | undefined
    if (item.reply != null && Array.isArray(item.reply) && depth < 5) {
      const replyList = verifyMusicCommentArray(item.reply, `${name} item reply`, depth + 1)
      if (replyList.length) reply = replyList
    }

    list[index] = {
      id,
      userId,
      userName,
      text,
      time,
      images,
      location,
      avatar,
      likedCount,
      skipPage,
      replyTotal,
      reply,
      replySkipPage,
    }
  })
}
const verifyMusicCommentAction = (
  result: ListCommonResult<AnyListen.Resource.MusicCommentItem>
): ListCommonResult<AnyListen.Resource.MusicCommentItem> => {
  verifyListCommonResult(result, 'music comment')
  verifyMusicCommentArray(result.list, 'music comment')
  return result
}

type RA = AnyListen.IPCExtension.ResourceAction
const actionHandles: RA = {
  async tipSearch(params) {
    return verifyTipSearchAction(await actions.tipSearch!(params))
  },
  async hotSearch(params) {
    return verifyHotSearchAction(await actions.hotSearch!(params))
  },
  async musicSearch(params) {
    return verifyMusicSearchAction(await actions.musicSearch!(params), params.source)
  },
  async musicPic(params) {
    return verifyMusicPicAction(await actions.musicPic!(params))
  },
  async musicUrl(params) {
    return verifyMusicUrlAction(await actions.musicUrl!(params))
  },
  async musicLyric(params) {
    return verifyLyricAction(await actions.musicLyric!(params))
  },
  async musicPicSearch(params) {
    return verifyMusicPicAction(await actions.musicPicSearch!(params))
  },
  async lyricSearch(params) {
    return verifyLyricSearchAction(await actions.lyricSearch!(params))
  },
  async lyricDetail(params) {
    return verifyLyricAction(await actions.lyricDetail!(params))
  },
  async songlistSearch(params) {
    return verifySonglistSearchAction(await actions.songlistSearch!(params))
  },
  async songlistSorts(params) {
    return verifySonglistSortsAction(await actions.songlistSorts!(params))
  },
  async songlistTags(params) {
    return verifySonglistTagsAction(await actions.songlistTags!(params))
  },
  async songlist(params) {
    return verifySonglistAction(await actions.songlist!(params))
  },
  async songlistDetail(params) {
    return verifySonglistDetailAction(await actions.songlistDetail!(params), params.source)
  },
  async topSongs(params) {
    return verifyTopSongsAction(await actions.topSongs!(params))
  },
  async topSongsDate(params) {
    return verifyTopSongsDateAction(await actions.topSongsDate!(params), params.source)
  },
  async topSongsDetail(params) {
    return verifyTopSongsDetailAction(await actions.topSongsDetail!(params), params.source)
  },
  async musicComment(params) {
    return verifyMusicCommentAction(await actions.musicComment!(params))
  },
}

export const onResourceAction = async <T extends keyof RA>(
  action: T,
  params: Parameters<RA[T]>[0]
): Promise<Awaited<ReturnType<RA[T]>>> => {
  if (!actions) throw new Error(withErrorReason('resource action not registered', actions, `action: ${action}`))

  if (!actions[action]) throw new Error(withErrorReason(`resource action ${String(action)} not registered`, actions[action]))
  // @ts-expect-error
  return actionHandles[action](params) as Awaited<ReturnType<RA[T]>>
}
