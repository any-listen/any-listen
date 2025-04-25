/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { ListCommonResult } from '@/types/api'

// type ExtractResourceActionReturnType<A> = AnyListen.IPCExtension.ResourceAction extends (action: AnyListen.IPCActionData<A, any>) => infer R ? R : never

let actions: Partial<AnyListen.IPCExtension.ResourceAction>
export const registerResourceAction = (_actions: Partial<AnyListen_API.ResourceAction>) => {
  actions = _actions
}

// type T = ExtractResourceActionReturnType<'musicSearch'>

// interface ResourceAction {
//   (action: IPCActionData<'tipSearch', CommonParams>): Promise<string[]>
//   (action: IPCActionData<'hotSearch', CommonParams>): Promise<string[]>
//   (action: IPCActionData<'musicSearch', SearchParams>): Promise<ListCommonResult<AnyListen.Music.MusicInfoOnline>>
//   (action: IPCActionData<'musicPic', MusicCommonParams>): Promise<string>
//   (action: IPCActionData<'musicUrl', MusicCommonParams>): Promise<string>
//   (action: IPCActionData<'lyricSearch', MusicCommonParams>): Promise<AnyListen.Music.LyricInfo[]>
//   (action: IPCActionData<'lyric', MusicCommonParams>): Promise<AnyListen.Music.LyricInfo>
//   (action: IPCActionData<'songlistSearch', SearchParams>): Promise<ListCommonResult<AnyListen.Resource.SongListItem>>
//   (action: IPCActionData<'songlistSorts', CommonParams>): Promise<AnyListen.Resource.TagItem[]>
//   (action: IPCActionData<'songlistTags', CommonParams>): Promise<AnyListen.Resource.TagGroupItem[]>
//   (action: IPCActionData<'songlist', SonglistListParams>): Promise<ListCommonResult<AnyListen.Resource.SongListItem>>
//   (action: IPCActionData<'songlistDetail', ListDetailParams>): Promise<ListCommonResult<AnyListen.Music.MusicInfoOnline>>
//   (action: IPCActionData<'leaderboard', CommonParams>): Promise<AnyListen.Resource.TagGroupItem[]>
//   (action: IPCActionData<'leaderboardDate', SonglistListParams>): Promise<ListCommonResult<AnyListen.Music.MusicInfoOnline>>
//   (action: IPCActionData<'leaderboardDetail', SonglistListParams>): Promise<ListCommonResult<AnyListen.Music.MusicInfoOnline>>
// }

const QUALITYS: AnyListen.Music.Quality[] = ['128k', '192k', '320k', 'wav', 'flac', 'flac24bit', 'dobly', 'master']
const qualityFilter = (qualitys: AnyListen.Music.MusicInfoOnline['meta']['qualitys']) => {
  return Object.fromEntries(
    (Object.entries(qualitys) as EntriesObject<typeof qualitys>)
      .filter(([quality]) => QUALITYS.includes(quality))
      .map(([key, data]) => {
        const dataArr = Object.entries(data!)
        if (dataArr.length > 20) throw new Error('quality type data too much')
        for (const [key, value] of dataArr) {
          if (typeof key != 'string' || key.length > 64) throw new Error('quality type key no match')
          if (typeof value == 'string') {
            if (value.length > 2048) throw new Error('quality type value no match')
          } else if (value != null) throw new Error('quality type value no match')
        }
        return [key, data]
      })
  )
}
const substrLength = (str: string, length = 128): string => {
  return str.length > length ? str.substring(0, length) : str
}
const verifyStringArray = (arr: string[], name: string): string[] => {
  if (!Array.isArray(arr)) throw new Error(`${name} result is not an array`)
  return arr.filter((s) => s != null).map((s) => substrLength(String(s)))
}
const verifyOnlineMusicArray = (
  list: AnyListen.Music.MusicInfoOnline[],
  name: string,
  source: string
): AnyListen.Music.MusicInfoOnline[] => {
  if (!Array.isArray(list)) throw new Error(`${name} result is not an array`)
  for (let i = list.length - 1; i >= 0; i--) {
    const musicInfo = list[i]
    try {
      if (!musicInfo) throw new Error(`${name} result contains null item`)
      if (musicInfo.id == null) throw new Error(`${name} result.id is null`)
      else musicInfo.id = substrLength(String(musicInfo.id))
      if (!musicInfo.name) throw new Error(`${name} music info name contains empty`)
      musicInfo.name = substrLength(String(musicInfo.name))
      musicInfo.singer = String(musicInfo.singer ? substrLength(String(musicInfo.singer)) : '')
      if (!musicInfo.interval || typeof musicInfo.interval != 'string' || !musicInfo.interval.includes(':')) {
        musicInfo.interval = null
      } else musicInfo.interval = substrLength(musicInfo.interval)
      musicInfo.isLocal = false
      if (!musicInfo.meta) throw new Error(`${name} result.meta is null`)
      musicInfo.meta.albumName &&= substrLength(String(musicInfo.meta.albumName))
      musicInfo.meta.createTime = 0
      musicInfo.meta.posTime = 0
      musicInfo.meta.updateTime = 0
      musicInfo.meta.musicId = substrLength(String(musicInfo.meta.musicId))
      musicInfo.meta.picUrl &&= substrLength(String(musicInfo.meta.picUrl), 2048)
      if (typeof musicInfo.meta.year != 'number' || musicInfo.meta.year > 10000000 || musicInfo.meta.year < 1) {
        delete musicInfo.meta.year
      } else musicInfo.meta.year = Math.trunc(musicInfo.meta.year)
      if (!musicInfo.meta.qualitys) throw new Error(`${name} result.meta.qualitys is null`)
      musicInfo.meta.qualitys = qualityFilter(musicInfo.meta.qualitys)
      musicInfo.meta.source = source
    } catch (e) {
      list.splice(i, 1)
    }
  }
  return list
}
const verifyListCommonResult = <T>(result: ListCommonResult<T>, name: string): ListCommonResult<T> => {
  if (!result) throw new Error(`${name} result is null`)
  if (typeof result.total != 'number') throw new Error(`${name} result.total is not an number`)
  if (typeof result.page != 'number') throw new Error(`${name} result.page is not an number`)
  if (typeof result.limit != 'number') throw new Error(`${name} result.limit is not an number`)
  return result
}
const urlRxp = /^(https?|file):\/\//
const verifyUrl = (url: string, name: string) => {
  if (typeof url != 'string') throw new Error(`${name} url result is not a string`)
  if (url.length > 2048) throw new Error(`${name} url is too long`)
  if (!urlRxp.test(url)) throw new Error(`${name} url is not a valid url`)
}
const verifyQuality = (quality: string) => {
  if (typeof quality != 'string') throw new Error(`quality is not a string`)
  if (!QUALITYS.includes(quality as AnyListen.Music.Quality)) throw new Error(`quality is not a valid quality`)
}
const verifyTipSearchAction = (result: string[]): string[] => {
  return verifyStringArray(result, 'tip search')
}
const verifyHotSearchAction = (result: string[]): string[] => {
  if (!Array.isArray(result)) throw new Error('hot search result is not an array')
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
// TODO verify datas
const verifyLyricSearchAction = (
  result: AnyListen.IPCExtension.LyricSearchResult[]
): AnyListen.IPCExtension.LyricSearchResult[] => {
  return result
}
const verifyLyricAction = (result: AnyListen.Music.LyricInfo): AnyListen.Music.LyricInfo => {
  return result
}
const verifySonglistSearchAction = (
  result: ListCommonResult<AnyListen.Resource.SongListItem>
): ListCommonResult<AnyListen.Resource.SongListItem> => {
  return result
}
const verifySonglistSortsAction = (result: AnyListen.Resource.TagItem[]): AnyListen.Resource.TagItem[] => {
  return result
}
const verifySonglistTagsAction = (result: AnyListen.Resource.TagGroupItem[]): AnyListen.Resource.TagGroupItem[] => {
  return result
}
const verifySonglistAction = (
  result: ListCommonResult<AnyListen.Resource.SongListItem>
): ListCommonResult<AnyListen.Resource.SongListItem> => {
  return result
}
const verifySonglistDetailAction = (
  result: ListCommonResult<AnyListen.Music.MusicInfoOnline>,
  source: string
): ListCommonResult<AnyListen.Music.MusicInfoOnline> => {
  verifyListCommonResult(result, 'songlist detail')
  verifyOnlineMusicArray(result.list, 'songlist detail', source)
  return result
}
const verifyLeaderboardAction = (result: AnyListen.Resource.TagGroupItem[]): AnyListen.Resource.TagGroupItem[] => {
  return result
}
// const verifyLeaderboardDateAction = (result: ListCommonResult<AnyListen.Music.MusicInfoOnline>, source: string): ListCommonResult<AnyListen.Music.MusicInfoOnline> => {
//   verifyListCommonResult(result, 'music search')
//   verifyOnlineMusicArray(result.list, 'music search', source)
//   return result
// }
const verifyLeaderboardDetailAction = (
  result: ListCommonResult<AnyListen.Music.MusicInfoOnline>,
  source: string
): ListCommonResult<AnyListen.Music.MusicInfoOnline> => {
  verifyListCommonResult(result, 'leaderboard detail')
  verifyOnlineMusicArray(result.list, 'leaderboard detail', source)
  return result
}

type RA = AnyListen.IPCExtension.ResourceAction
export const onResourceAction = async <T extends keyof RA>(
  action: T,
  params: Parameters<RA[T]>[0]
): Promise<Awaited<ReturnType<RA[T]>>> => {
  if (!actions) throw new Error('resource action not registered')
  if (!actions[action]) throw new Error(`resource action ${action} not registered`)
  switch (action) {
    // case 'tipSearch':
    //   return verifyTipSearchAction(await actions.tipSearch!(params)) as Awaited<ReturnType<RA[T]>>
    // case 'hotSearch':
    //   return verifyHotSearchAction(await actions.hotSearch!(params)) as Awaited<ReturnType<RA[T]>>
    case 'musicSearch':
      return verifyMusicSearchAction(
        await actions.musicSearch!(params as AnyListen.IPCExtension.SearchParams),
        params.source
      ) as Awaited<ReturnType<RA[T]>>
    case 'musicPic':
      return verifyMusicPicAction(await actions.musicPic!(params as AnyListen.IPCExtension.MusicCommonParams)) as Awaited<
        ReturnType<RA[T]>
      >
    case 'musicUrl':
      return verifyMusicUrlAction(await actions.musicUrl!(params as AnyListen.IPCExtension.MusicUrlParams)) as Awaited<
        ReturnType<RA[T]>
      >
    case 'musicLyric':
      return verifyLyricAction(await actions.musicLyric!(params as AnyListen.IPCExtension.MusicCommonParams)) as Awaited<
        ReturnType<RA[T]>
      >
    case 'musicPicSearch':
      return verifyMusicPicAction(await actions.musicPicSearch!(params as AnyListen.IPCExtension.PicSearchParams)) as Awaited<
        ReturnType<RA[T]>
      >
    case 'lyricSearch':
      return verifyLyricSearchAction(await actions.lyricSearch!(params as AnyListen.IPCExtension.LyricSearchParams)) as Awaited<
        ReturnType<RA[T]>
      >
    case 'lyricDetail':
      return verifyLyricAction(await actions.lyricDetail!(params as AnyListen.IPCExtension.ListDetailParams)) as Awaited<
        ReturnType<RA[T]>
      >
    // case 'songlistSearch':
    //   return verifySonglistSearchAction(await actions.songlistSearch!(params)) as Awaited<ReturnType<RA[T]>>
    // case 'songlistSorts':
    //   return verifySonglistSortsAction(await actions.songlistSorts!(params)) as Awaited<ReturnType<RA[T]>>
    // case 'songlistTags':
    //   return verifySonglistTagsAction(await actions.songlistTags!(params)) as Awaited<ReturnType<RA[T]>>
    // case 'songlist':
    //   return verifySonglistAction(await actions.songlist!(params)) as Awaited<ReturnType<RA[T]>>
    // case 'songlistDetail':
    //   return verifySonglistDetailAction(await actions.songlistDetail!(params), action.data.source) as Awaited<ReturnType<RA[T]>>
    // case 'leaderboard':
    //   return verifyLeaderboardAction(await actions.leaderboard!(params)) as Awaited<ReturnType<RA[T]>>
    // // case 'leaderboardDate': return verifyLeaderboardDateAction(await handler(action))
    // case 'leaderboardDetail':
    //   return verifyLeaderboardDetailAction(await actions.leaderboardDetail!(params), action.data.source) as Awaited<ReturnType<RA[T]>>

    default:
      // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      const unknownAction: never = action
      throw new Error(`unknown action: ${JSON.stringify(action)}`)
  }
  // return handler(
  //   // @ts-expect-error
  //   action,
  // )
}
