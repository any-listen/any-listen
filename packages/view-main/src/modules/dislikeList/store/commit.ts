import { SPLIT_CHAR } from '@any-listen/common/constants'

import { dislikeListEvent } from './event'
import { dislikeListState } from './state'

export const initInfo = ({ musicNames, rules, names, singerNames }: AnyListen.Dislike.DislikeInfo) => {
  dislikeListState.names = new Set(names)
  dislikeListState.singerNames = new Set(singerNames)
  dislikeListState.musicNames = new Set(musicNames)
  dislikeListState.rules = rules
  dislikeListState.count = dislikeListState.musicNames.size + dislikeListState.singerNames.size + dislikeListState.names.size
  dislikeListEvent.updated()
}

const initNameSet = () => {
  dislikeListState.names.clear()
  dislikeListState.musicNames.clear()
  dislikeListState.singerNames.clear()
  const list: string[] = []
  for (const item of dislikeListState.rules.split('\n')) {
    if (!item) continue
    let [name, singer] = item.split(SPLIT_CHAR.DISLIKE_NAME)
    if (name) {
      name = name.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
      if (singer) {
        singer = singer.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
        const rule = `${name}${SPLIT_CHAR.DISLIKE_NAME}${singer}`
        dislikeListState.names.add(rule)
        list.push(rule)
      } else {
        dislikeListState.musicNames.add(name)
        list.push(name)
      }
    } else if (singer) {
      singer = singer.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
      dislikeListState.singerNames.add(singer)
      list.push(`${SPLIT_CHAR.DISLIKE_NAME}${singer}`)
    }
  }
  dislikeListState.rules = Array.from(new Set(list)).join('\n')
  dislikeListState.count = dislikeListState.musicNames.size + dislikeListState.singerNames.size + dislikeListState.names.size
}

export const addDislikeInfo = (infos: AnyListen.Dislike.DislikeMusicInfo[]) => {
  dislikeListState.rules += `\n${infos.map((info) => `${info.name ?? ''}${SPLIT_CHAR.DISLIKE_NAME}${info.singer ?? ''}`).join('\n')}`
  initNameSet()
  dislikeListEvent.updated()
}

export const overwirteDislikeInfo = (rules: string) => {
  dislikeListState.rules = rules
  initNameSet()
  dislikeListEvent.updated()
}

export const clearDislikeInfo = () => {
  dislikeListState.rules = ''
  initNameSet()
  dislikeListEvent.updated()
}
