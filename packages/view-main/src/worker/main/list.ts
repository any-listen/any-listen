/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// import { throttle } from '@common/utils'

import { SPLIT_CHAR } from '@any-listen/common/constants'

import { arrPushByPosition, arrShuffle, escapeRegExp, similar, sortInsert } from '@/shared'
// import { joinPath, saveStrToFile } from '@common/utils/nodejs'
// import { createLocalMusicInfo } from '@/shared/music'

/**
 * 获取不喜欢id列表
 * @param list 播放列表
 * @param dislikeInfo 不喜欢的歌曲名字列表
 * @returns
 */
export const getDislikeIds = (
  list: AnyListen.Player.PlayMusicInfo[],
  dislikeInfo: {
    names: Set<string>
    musicNames: Set<string>
    singerNames: Set<string>
  }
) => {
  const hasDislike = (info: AnyListen.Music.MusicInfo) => {
    const name = info.name?.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim() ?? ''
    const singer =
      info.singer?.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim() ?? ''

    return (
      dislikeInfo.musicNames.has(name) ||
      dislikeInfo.singerNames.has(singer) ||
      dislikeInfo.names.has(`${name}${SPLIT_CHAR.DISLIKE_NAME}${singer}`)
    )
  }

  const disableIds = new Set<string>()
  for (const m of list) {
    if (hasDislike(m.musicInfo)) disableIds.add(m.itemId)
  }

  return disableIds
}

/**
 * 过滤列表中已播放的歌曲
 */
// export const filterMusicList = async({ list, playerMusicInfo, dislikeIds }: {
//   /**
//    * 播放列表
//    */
//   list: AnyListen.Player.PlayMusicInfo[]
//   /**
//    * 播放器内当前歌曲
//    */
//   playerMusicInfo: AnyListen.Player.PlayMusicInfo | null
//   /**
//    * 不喜欢的歌曲名字列表
//    */
//   dislikeIds: Set<string>
// }) => {
//   const playLaterList: AnyListen.Player.PlayMusicInfo[] = []
//   const playList: AnyListen.Player.PlayMusicInfo[] = []

//   for (const m of list) {
//     if (m.playLater) playLaterList.push(m)
//     else if (!dislikeIds.has(m.itemId) || playerMusicInfo?.itemId == m.itemId) {
//       playList.push(m)
//     }
//   }
//   return [playLaterList, playList] as const

//   // let playerIndex = -1

//   // let canPlayList: Array<AnyListen.Music.MusicInfo | AnyListen.Download.ListItem> = []
//   // const filteredPlayedList = playedList.filter(pmInfo => pmInfo.listId == listId && !pmInfo.isTempPlay).map(({ musicInfo }) => musicInfo)

//   // let isDislike = false
//   // const filteredList: Array<AnyListen.Music.MusicInfo | AnyListen.Download.ListItem> = list.filter(s => {
//   //   // if (!assertApiSupport(s.source)) return false
//   //   if ('progress' in s) {
//   //     if (!s.isComplate) return false
//   //   } else if (hasDislike(s)) {
//   //     if (s.id != playerMusicInfo?.id) return false
//   //     isDislike = true
//   //   }

//   //   canPlayList.push(s)

//   //   let index = filteredPlayedList.findIndex(m => m.id == s.id)
//   //   if (index > -1) {
//   //     filteredPlayedList.splice(index, 1)
//   //     return false
//   //   }
//   //   return true
//   // })
//   // if (playerMusicInfo) {
//   //   if (isDislike) {
//   //     if (filteredList.length <= 1) {
//   //       filteredList.splice(0, 1)
//   //       if (canPlayList.length > 1) {
//   //         let currentMusicIndex = canPlayList.findIndex(m => m.id == playerMusicInfo.id)
//   //         if (isNext) {
//   //           playerIndex = currentMusicIndex - 1
//   //           if (playerIndex < 0 && canPlayList.length > 1) playerIndex = canPlayList.length - 2
//   //         } else {
//   //           playerIndex = currentMusicIndex
//   //           if (canPlayList.length <= 1) playerIndex = -1
//   //         }
//   //         canPlayList.splice(currentMusicIndex, 1)
//   //       } else canPlayList.splice(0, 1)
//   //     } else {
//   //       let currentMusicIndex = filteredList.findIndex(m => m.id == playerMusicInfo.id)
//   //       if (isNext) {
//   //         playerIndex = currentMusicIndex - 1
//   //         if (playerIndex < 0 && filteredList.length > 1) playerIndex = filteredList.length - 2
//   //       } else {
//   //         playerIndex = currentMusicIndex
//   //         if (filteredList.length <= 1) playerIndex = -1
//   //       }
//   //       filteredList.splice(currentMusicIndex, 1)
//   //     }
//   //   } else {
//   //     playerIndex = (filteredList.length ? filteredList : canPlayList).findIndex(m => m.id == playerMusicInfo.id)
//   //   }
//   // }
//   // return {
//   //   filteredList,
//   //   canPlayList,
//   //   playerIndex,
//   // }
// }

const getIntv = (musicInfo: AnyListen.Music.MusicInfo) => {
  if (!musicInfo.interval) return 0
  // if (musicInfo._interval) return musicInfo._interval
  let intvArr = musicInfo.interval.split(':')
  let intv = 0
  let unit = 1
  while (intvArr.length) {
    intv += parseInt(intvArr.pop()!) * unit
    unit *= 60
  }
  return intv
}

export type SortFieldName = 'name' | 'singer' | 'albumName' | 'interval' | 'createTime' | 'updateTime'
export type SortFieldType = 'up' | 'down' | 'random'
/**
 * 排序歌曲
 * @param list 歌曲列表
 * @param sortType 排序类型
 * @param fieldName 排序字段
 * @param localeId 排序语言
 * @returns
 */
export const sortListMusicInfo = async (
  list: AnyListen.Music.MusicInfo[],
  sortType: SortFieldType,
  fieldName: SortFieldName,
  localeId: string
) => {
  // console.log(sortType, fieldName, localeId)
  // const locale = new Intl.Locale(localeId)
  switch (sortType) {
    case 'random':
      arrShuffle(list)
      break
    case 'up':
      if (fieldName == 'interval') {
        list.sort((a, b) => {
          if (a.interval == null) {
            return b.interval == null ? 0 : -1
          }
          return b.interval == null ? 1 : getIntv(a) - getIntv(b)
        })
      } else if (fieldName == 'createTime' || fieldName == 'updateTime') {
        list.sort((a, b) => {
          let aTime = a.meta[fieldName]
          let bTime = b.meta[fieldName]
          if (aTime == null) {
            return bTime == null ? 0 : -1
          }
          return bTime == null ? 1 : aTime - bTime
        })
      } else {
        switch (fieldName) {
          case 'name':
          case 'singer':
            list.sort((a, b) => {
              if (a[fieldName] == null) {
                return b[fieldName] == null ? 0 : -1
              }
              return b[fieldName] == null ? 1 : a[fieldName].localeCompare(b[fieldName], localeId)
            })
            break
          case 'albumName':
            list.sort((a, b) => {
              if (a.meta.albumName == null) {
                return b.meta.albumName == null ? 0 : -1
              }
              return b.meta.albumName == null ? 1 : a.meta.albumName.localeCompare(b.meta.albumName, localeId)
            })
            break
        }
      }
      break
    case 'down':
      if (fieldName == 'interval') {
        list.sort((a, b) => {
          if (a.interval == null) {
            return b.interval == null ? 0 : 1
          }
          return b.interval == null ? -1 : getIntv(b) - getIntv(a)
        })
      } else if (fieldName == 'createTime' || fieldName == 'updateTime') {
        list.sort((a, b) => {
          let aTime = a.meta[fieldName]
          let bTime = b.meta[fieldName]
          if (aTime == null) {
            return bTime == null ? 0 : 1
          }
          return bTime == null ? -1 : bTime - aTime
        })
      } else {
        switch (fieldName) {
          case 'name':
          case 'singer':
            list.sort((a, b) => {
              if (a[fieldName] == null) {
                return b[fieldName] == null ? 0 : 1
              }
              return b[fieldName] == null ? -1 : b[fieldName].localeCompare(a[fieldName], localeId)
            })
            break
          case 'albumName':
            list.sort((a, b) => {
              if (a.meta.albumName == null) {
                return b.meta.albumName == null ? 0 : 1
              }
              return b.meta.albumName == null ? -1 : b.meta.albumName.localeCompare(a.meta.albumName, localeId)
            })
            break
        }
      }
      break
  }
  return list
}

const variantRxp = /(\(|（).+(\)|）)/g
const variantRxp2 = /\s|'|\.|,|，|&|"|、|\(|\)|（|）|`|~|-|<|>|\||\/|\]|\[/g
export interface DuplicateMusicItem {
  id: string
  index: number
  group: string
  musicInfo: AnyListen.Music.MusicInfo
}
/**
 * 过滤列表内重复的歌曲
 * @param list 歌曲列表
 * @param isFilterVariant 是否过滤 Live Explicit 等歌曲名
 * @returns
 */
export const filterDuplicateMusic = async (list: AnyListen.Music.MusicInfo[], isFilterVariant = true) => {
  const listMap = new Map<string, DuplicateMusicItem[]>()
  const duplicateList = new Set<string>()
  const handleFilter = (name: string, index: number, musicInfo: AnyListen.Music.MusicInfo) => {
    if (listMap.has(name)) {
      const targetMusicInfo = listMap.get(name)
      targetMusicInfo!.push({
        id: musicInfo.id,
        index,
        musicInfo,
        group: name,
      })
      duplicateList.add(name)
    } else {
      listMap.set(name, [
        {
          id: musicInfo.id,
          index,
          musicInfo,
          group: name,
        },
      ])
    }
  }
  if (isFilterVariant) {
    list.forEach((musicInfo, index) => {
      let musicInfoName = musicInfo.name.toLowerCase().replace(variantRxp, '').replace(variantRxp2, '')
      musicInfoName ||= musicInfo.name.toLowerCase().replace(/\s+/g, '')
      handleFilter(musicInfoName, index, musicInfo)
    })
  } else {
    list.forEach((musicInfo, index) => {
      const musicInfoName = musicInfo.name.toLowerCase().trim()
      handleFilter(musicInfoName, index, musicInfo)
    })
  }
  // console.log(duplicateList)
  const duplicateNames = Array.from(duplicateList)
  duplicateNames.sort((a, b) => a.localeCompare(b))
  return duplicateNames.map((name) => listMap.get(name)!).flat()
}

export const searchListMusic = (list: AnyListen.Music.MusicInfo[], text: string) => {
  let result: AnyListen.Music.MusicInfo[] = []
  let rxp = new RegExp(
    `${text
      .split('')
      .map((s) => escapeRegExp(s))
      .join('.*')}.*`,
    'i'
  )
  for (const mInfo of list) {
    const str = `${mInfo.name}${mInfo.singer}${mInfo.meta.albumName ? mInfo.meta.albumName : ''}`
    if (rxp.test(str)) result.push(mInfo)
  }

  const sortedList: Array<{ num: number; data: AnyListen.Music.MusicInfo }> = []

  for (const mInfo of result) {
    sortInsert(sortedList, {
      num: similar(text, `${mInfo.name}${mInfo.singer}${mInfo.meta.albumName ? mInfo.meta.albumName : ''}`),
      data: mInfo,
    })
  }
  return sortedList.map((item) => item.data).reverse()
}

/**
 * 创建排序后的列表
 * @param list 原始列表
 * @param position 新位置
 * @param ids 要调整顺序的歌曲id
 * @returns
 */
export const createSortedList = (list: AnyListen.Music.MusicInfo[], position: number, ids: string[]) => {
  const infos: AnyListen.Music.MusicInfo[] = []
  const map = new Map<string, AnyListen.Music.MusicInfo>()
  for (const item of list) map.set(item.id, item)
  for (const id of ids) {
    infos.push(map.get(id)!)
    map.delete(id)
  }
  list = list.filter((mInfo) => map.has(mInfo.id))
  arrPushByPosition(list, infos, Math.min(position, list.length))
  return list
}

/**
 * 创建本地列表音乐信息
 * @param filePaths 文件路径
 */
// export const createLocalMusicInfos = async(filePaths: string[]): Promise<AnyListen.Music.MusicInfoLocal[]> => {
//   const list: AnyListen.Music.MusicInfoLocal[] = []
//   for await (const path of filePaths) {
//     const musicInfo = await createLocalMusicInfo(path)
//     if (!musicInfo) continue
//     list.push(musicInfo)
//   }

//   return list
// }

/**
 * 导出列表到txt文件
 * @param savePath 保存路径
 * @param lists 列表数据
 * @param isMerge 是否合并
 */
// export const exportPlayListToText = async(savePath: string, lists: Array<AnyListen.List.MyDefaultListInfoFull | AnyListen.List.MyLoveListInfoFull | AnyListen.List.UserListInfoFull>, isMerge: boolean) => {
//   const iconv = await import('iconv-lite')

//   if (isMerge) {
//     await saveStrToFile(savePath,
//       iconv.encode(lists.map(l => l.list.map(m => `${m.name}  ${m.singer}  ${m.meta.albumName ?? ''}`).join('\n')).join('\n\n'), 'utf8', { addBOM: true }))
//   } else {
//     for await (const list of lists) {
//       await saveStrToFile(joinPath(savePath, `lx_list_${filterFileName(list.name)}.txt`),
//         iconv.encode(list.list.map(m => `${m.name}  ${m.singer}  ${m.meta.albumName ?? ''}`).join('\n'), 'utf8', { addBOM: true }))
//     }
//   }
// }

/**
 * 导出列表到csv文件
 * @param savePath 保存路径
 * @param lists 列表数据
 * @param isMerge 是否合并
 * @param header 表头名称
 */
// export const exportPlayListToCSV = async(savePath: string,
//   lists: Array<AnyListen.List.MyDefaultListInfoFull | AnyListen.List.MyLoveListInfoFull | AnyListen.List.UserListInfoFull>,
//   isMerge: boolean,
//   header: string) => {
//   const iconv = await import('iconv-lite')

//   const filterStr = (str: string) => {
//     if (!str) return ''
//     str = str.replace(/"/g, '""')
//     if (str.includes(',')) str = `"${str}"`
//     return str
//   }

//   if (isMerge) {
//     await saveStrToFile(savePath, iconv.encode(header + lists.map(l => l.list.map(m => `${filterStr(m.name)},${filterStr(m.singer)},${filterStr(m.meta.albumName ?? '')}`).join('\n')).join('\n'), 'utf8', { addBOM: true }))
//   } else {
//     for await (const list of lists) {
//       await saveStrToFile(joinPath(savePath, `lx_list_${filterFileName(list.name)}.csv`), iconv.encode(header + list.list.map(m => `${filterStr(m.name)},${filterStr(m.singer)},${filterStr(m.meta.albumName ?? '')}`).join('\n'), 'utf8', { addBOM: true }))
//     }
//   }
// }
