/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { SINGERS_RXP } from '@any-listen/common/constants'

import { services } from '../../resources/shared'
import { versionChars } from './versionChars'

export const musicSearch = async (
  extensionId: string,
  source: string,
  name: string,
  artist: string,
  page: number,
  limit?: number
): Promise<{
  list: AnyListen.Music.MusicInfoOnline[]
  total: number
  limit: number
  page: number
}> => {
  // console.log(extensionId, source, artist, page, limit)
  if (!name.trim().length) {
    return {
      list: [],
      total: 0,
      limit: limit ?? 10,
      page,
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
        limit: result.limit ?? 10,
        page: result.page ?? 1,
      }
    })
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
  // console.log({
  //   extensionId,
  //   name,
  //   singer,
  //   albumName,
  //   interval,
  //   source: s,
  // })
  // TODO: auto reversal of singer and name
  const list = await musicSearch(extensionId, s, name, singer, 1, 20).catch((err) => {
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
  const isEqualsInterval = (intv: number) => Math.abs((fInterval || intv) - (intv || fInterval)) <= 5
  const isEqualsVersionMusicNameChar = (name: string) => {
    for (const char of versionChars) {
      if (name.includes(char) != fMusicName.includes(char)) return false
    }
    return true
  }
  const isIncludesName = (name: string) =>
    (fMusicName.includes(name) || name.includes(fMusicName)) && isEqualsVersionMusicNameChar(name)
  const isIncludesSinger = (singer: string) => (fSinger ? fSinger.includes(singer) || singer.includes(fSinger) : true)
  const isEqualsAlbum = (album: string) => (fAlbumName ? fAlbumName == album : true)
  // console.log(fMusicName, fSinger, fAlbumName, fInterval)

  const handleSource = (source: { list: AnyListen.Music.MusicInfoOnline[]; total: number }) => {
    for (const _item of source.list) {
      const item = _item as FindMusicType
      item.name = trimStr(item.name!)
      item.singer = trimStr(item.singer)
      item.fSinger = filterStr(sortSingle(item.singer).toLowerCase())
      item.fMusicName = filterStr(String(item.name ?? '').toLowerCase())
      item.fAlbumName = filterStr(String(item.meta.albumName ?? '').toLowerCase())
      item.fInterval = getIntv(item.interval)
      // console.log(item.fMusicName, item.fSinger, item.fAlbumName, item.fInterval)
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
