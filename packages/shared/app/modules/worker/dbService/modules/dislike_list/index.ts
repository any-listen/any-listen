import { SPLIT_CHAR } from '@any-listen/common/constants'

import { inertDislikeList, overwirteDislikeList, queryDislikeList } from './dbHelper'
import type { DislikeInfo } from './statements'

// let dislikeInfo: AnyListen.Dislike.DislikeInfo

const toDBDislikeInfo = (musicInfos: string[]): DislikeInfo[] => {
  const list: DislikeInfo[] = []
  for (const item of musicInfos) {
    if (!item.trim()) continue
    list.push({
      content: item,
    })
  }
  return list
}

const initDislikeList = (): AnyListen.Dislike.DislikeInfo => {
  const dislikeInfo = {
    // musicIds: new Set<string>(),
    names: new Set<string>(),
    singerNames: new Set<string>(),
    musicNames: new Set<string>(),
    rules: '',
  }
  const list: string[] = []
  for (const item of queryDislikeList()) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!item) continue
    let [name, singer] = item.content.split(SPLIT_CHAR.DISLIKE_NAME)
    if (name) {
      name = name.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
      if (singer) {
        singer = singer.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
        const rule = `${name}${SPLIT_CHAR.DISLIKE_NAME}${singer}`
        dislikeInfo.names.add(rule)
        list.push(rule)
      } else {
        dislikeInfo.musicNames.add(name)
        list.push(name)
      }
    } else if (singer) {
      singer = singer.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
      dislikeInfo.singerNames.add(singer)
      list.push(`${SPLIT_CHAR.DISLIKE_NAME}${singer}`)
    }
  }

  dislikeInfo.rules = Array.from(new Set(list)).join('\n')

  return {
    names: Array.from(dislikeInfo.names),
    singerNames: Array.from(dislikeInfo.singerNames),
    musicNames: Array.from(dislikeInfo.musicNames),
    rules: dislikeInfo.rules,
  }
}

/**
 * 获取不喜欢列表信息
 * @returns 不喜欢列表信息
 */
export const getDislikeListInfo = (): AnyListen.Dislike.DislikeInfo => {
  // if (!dislikeInfo) initDislikeList()
  return initDislikeList()
}

/**
 * 添加信息
 * @param lists 列表信息
 */
export const dislikeInfoAdd = async (lists: AnyListen.Dislike.DislikeMusicInfo[]) => {
  await inertDislikeList(lists.map((info) => ({ content: `${info.name}${SPLIT_CHAR.DISLIKE_NAME}${info.singer}` })))
}

/**
 * 覆盖列表信息
 * @param rules 规则信息
 */
export const dislikeInfoOverwrite = async (rules: string) => {
  await overwirteDislikeList(toDBDislikeInfo(rules.split('\n')))
}

// /**
//  * 删除不喜欢列表
//  * @param ids 歌曲id
//  */
// export const dislikeInfoRemove = (ids: string[]) => {
//   deleteDislikeList(ids)
// }

// /**
//  * 清空不喜欢列表
//  */
// export const dislikeInfoClear = () => {
//   clearDislikeList()
// }
