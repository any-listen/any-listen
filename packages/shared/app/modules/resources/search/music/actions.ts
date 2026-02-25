/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { SINGERS_RXP } from '@any-listen/common/constants'

import { services } from '../../../resources/shared'
// import { musicState } from './state'

// interface SearchResult {
//   list: AnyListen.Music.MusicInfo[]
//   allPage: number
//   limit: number
//   total: number
//   source: string
// }

// /**
//  * 按搜索关键词重新排序列表
//  * @param list 歌曲列表
//  * @param keyword 搜索关键词
//  * @returns 排序后的列表
//  */
// const handleSortList = (list: AnyListen.Music.MusicInfo[], keyword: string) => {
//   let arr: any[] = []
//   for (const item of list) {
//     sortInsert(arr, {
//       num: similar(keyword, `${item.name} ${item.singer}`),
//       data: item,
//     })
//   }
//   return arr.map(item => item.data).reverse()
// }

// const setLists = (results: SearchResult[], page: number, text: string): AnyListen.Music.MusicInfo[] => {
//   let pages = []
//   let totals = []
//   let limit = 0
//   let list = []
//   for (const source of results) {
//     maxPages[source.source] = source.allPage
//     limit = Math.max(source.limit, limit)
//     if (source.allPage < page) continue
//     list.push(...source.list)
//     pages.push(source.allPage)
//     totals.push(source.total)
//   }
//   list = deduplicationList(list.map(s => markRaw(toNewMusicInfo(s))))
//   let listInfo = listInfos.all
//   listInfo.maxPage = Math.max(0, ...pages)
//   const total = Math.max(0, ...totals)
//   if (page == 1 || (total && list.length)) listInfo.total = total
//   else listInfo.total = limit * page
//   // listInfo.limit = limit
//   listInfo.page = page
//   listInfo.list = handleSortList(list, text)
//   if (text && !list.length && page == 1) listInfo.noItemLabel = window.i18n.t('no_item')
//   else listInfo.noItemLabel = ''
//   return listInfo.list
// }

// const setList = (datas: SearchResult, page: number, text: string): AnyListen.Music.MusicInfo[] => {
//   // console.log(datas.source, datas.list)
//   let listInfo = listInfos[datas.source]!
//   listInfo.list = deduplicationList(datas.list.map(s => markRaw(toNewMusicInfo(s))))
//   if (page == 1 || (datas.total && datas.list.length)) listInfo.total = datas.total
//   else listInfo.total = datas.limit * page
//   listInfo.maxPage = datas.allPage
//   listInfo.page = page
//   listInfo.limit = datas.limit
//   if (text && !datas.list.length && page == 1) listInfo.noItemLabel = window.i18n.t('no_item')
//   else listInfo.noItemLabel = ''
//   return listInfo.list
// }

// export const resetListInfo = (sourceId: string): [] => {
//   let listInfo = musicState.lists.get(sourceId)
//   if (listInfo) {
//     listInfo.list = []
//     listInfo.page = 0
//     listInfo.maxPage = 0
//     listInfo.total = 0
//     listInfo.loading = false
//     listInfo.error = false
//     listInfo.label = ''
//   }
//   return []
// }

export const search = async (
  extensionId: string,
  source: string,
  name: string,
  artist: string,
  page: number,
  limit: number
): Promise<{
  list: AnyListen.Music.MusicInfoOnline[]
  total: number
}> => {
  // console.log(extensionId, source, artist, page, limit)
  if (!name.trim().length) {
    return {
      list: [],
      total: 0,
    }
  }
  return services.extensionSerive
    .resourceAction('musicSearch', {
      extensionId,
      source,
      name,
      artist,
      limit,
      page,
    })
    .then((result) => {
      // console.log(result)
      return {
        list: result.list ?? [],
        total: result.total,
      }
    })
  // const listInfo = musicState.lists.get(sourceId)
  // if (!text) return resetListInfo(sourceId)
  // const key = `${page}__${text}`
  // if (sourceId == 'all') {
  //   listInfo!.noItemLabel = window.i18n.t('list__loading')
  //   listInfo!.key = key
  //   let task = []
  //   for (const source of sources) {
  //     if (source == 'all') continue
  //     task.push((music[source]?.musicSearch.search(text, page, listInfos.all.limit) ?? Promise.reject(new Error(`source not found: ${source}`))).catch((error: any) => {
  //       console.log(error)
  //       return {
  //         allPage: 1,
  //         limit: 30,
  //         list: [],
  //         source,
  //         total: 0,
  //       }
  //     }))
  //   }
  //   return Promise.all(task).then((results: SearchResult[]) => {
  //     if (key != listInfo!.key) return []
  //     return setLists(results, page, text)
  //   })
  // }
  // if (listInfo?.key == key && listInfo?.list.length) return listInfo?.list
  // listInfo!.noItemLabel = window.i18n.t('list__loading')
  // listInfo!.key = key
  // return music[sourceId].musicSearch.search(text, page, listInfo!.limit).then((data: SearchResult) => {
  //   if (key != listInfo!.key) return []
  //   return setList(data, page, text)
  // }).catch((error: any) => {
  //   resetListInfo(sourceId)
  //   listInfo!.noItemLabel = window.i18n.t('list__load_failed')
  //   console.log(error)
  //   throw error
  // })
}

type FindMusicType = Omit<AnyListen.Music.MusicInfoOnline, 'name'> & {
  name: null | string
  fSinger?: string
  fMusicName?: string
  fAlbumName?: string
  fInterval?: number
}
export const findMusic = async ({
  extensionId,
  name,
  singer,
  albumName,
  interval,
  source: s,
}: {
  extensionId: string
  source: string
  name: string
  singer: string
  albumName: string
  interval: string | null
}): Promise<AnyListen.Music.MusicInfoOnline | null> => {
  // TODO: auto reversal of singer and name
  const list = await search(extensionId, s, name, singer, 1, 20).catch((err) => {
    console.error(err)
    return null
  })
  if (!list) return null

  const sortSingle = (singer: string) =>
    SINGERS_RXP.test(singer)
      ? singer
          .split(SINGERS_RXP)
          .map((s) => s.trim())
          .filter((s) => s)
          .sort((a, b) => a.localeCompare(b))
          .join('、')
      : singer || ''
  const sortMusic = (arr: FindMusicType[], callback: (item: FindMusicType) => boolean) => {
    const tempResult = []
    for (let i = arr.length - 1; i > -1; i--) {
      const item = arr[i]
      if (callback(item)) {
        delete item.fSinger
        delete item.fMusicName
        delete item.fAlbumName
        delete item.fInterval
        tempResult.push(item)
        arr.splice(i, 1)
      }
    }
    tempResult.reverse()
    return tempResult
  }
  const getIntv = (interval?: string | null) => {
    if (!interval) return 0
    // if (musicInfo._interval) return musicInfo._interval
    const intvArr = interval.split(':')
    let intv = 0
    let unit = 1
    while (intvArr.length) {
      intv += parseInt(intvArr.pop()!) * unit
      unit *= 60
    }
    return intv
  }
  const trimStr = (str: string) => (typeof str == 'string' ? str.trim() : str || '')
  const filterStr = (str: string) =>
    typeof str == 'string' ? str.replace(/\s|'|\.|,|，|&|"|、|\(|\)|（|）|`|~|-|<|>|\||\/|\]|\[|!|！/g, '') : String(str || '')
  const fMusicName = filterStr(name).toLowerCase()
  const fSinger = filterStr(sortSingle(singer)).toLowerCase()
  const fAlbumName = filterStr(albumName).toLowerCase()
  const fInterval = getIntv(interval)
  const isEqualsInterval = (intv: number) => Math.abs((fInterval || intv) - (intv || fInterval)) < 5
  const isIncludesName = (name: string) => fMusicName.includes(name) || name.includes(fMusicName)
  const isIncludesSinger = (singer: string) => (fSinger ? fSinger.includes(singer) || singer.includes(fSinger) : true)
  const isEqualsAlbum = (album: string) => (fAlbumName ? fAlbumName == album : true)

  const handleSource = (source: { list: AnyListen.Music.MusicInfoOnline[]; total: number }) => {
    for (const _item of source.list) {
      const item = _item as FindMusicType
      item.name = trimStr(item.name!)
      item.singer = trimStr(item.singer)
      item.fSinger = filterStr(sortSingle(item.singer).toLowerCase())
      item.fMusicName = filterStr(String(item.name ?? '').toLowerCase())
      item.fAlbumName = filterStr(String(item.meta.albumName ?? '').toLowerCase())
      item.fInterval = getIntv(item.interval)
      // console.log(fMusicName, item.fMusicName, item.source)
      if (!isEqualsInterval(item.fInterval)) {
        item.name = null
        continue
      }
      if (item.fMusicName == fMusicName && isIncludesSinger(item.fSinger)) return item
    }
    for (const item of source.list as FindMusicType[]) {
      if (item.name == null) continue
      if (item.fSinger == fSinger && isIncludesName(item.fMusicName!)) return item
    }
    for (const item of source.list as FindMusicType[]) {
      if (item.name == null) continue
      if (isEqualsAlbum(item.fAlbumName!) && isIncludesSinger(item.fSinger!) && isIncludesName(item.fMusicName!)) return item
    }
    return null
  }

  const result = [handleSource(list)].filter((s) => s != null)
  const newResult = []
  if (result.length) {
    newResult.push(
      ...sortMusic(result, (item) => item.fSinger == fSinger && item.fMusicName == fMusicName && item.interval == interval)
    )
    newResult.push(
      ...sortMusic(result, (item) => item.fMusicName == fMusicName && item.fSinger == fSinger && item.fAlbumName == fAlbumName)
    )
    newResult.push(...sortMusic(result, (item) => item.fSinger == fSinger && item.fMusicName == fMusicName))
    newResult.push(...sortMusic(result, (item) => item.fMusicName == fMusicName && item.interval == interval))
    newResult.push(...sortMusic(result, (item) => item.fSinger == fSinger && item.interval == interval))
    newResult.push(...sortMusic(result, (item) => item.interval == interval))
    newResult.push(...sortMusic(result, (item) => item.fMusicName == fMusicName))
    newResult.push(...sortMusic(result, (item) => item.fSinger == fSinger))
    newResult.push(...sortMusic(result, (item) => item.fAlbumName == fAlbumName))
    for (const item of result) {
      delete item.fSinger
      delete item.fMusicName
      delete item.fAlbumName
      delete item.fInterval
    }
    newResult.push(...result)
  }
  // console.log(newResult)
  return (newResult as unknown as AnyListen.Music.MusicInfoOnline[])[0] ?? null
}
