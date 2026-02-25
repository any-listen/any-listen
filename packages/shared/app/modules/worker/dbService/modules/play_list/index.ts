/* eslint-disable @typescript-eslint/naming-convention */
import { arrPush, arrPushByPosition } from '@any-listen/common/utils'

import {
  clearList,
  deleteInfo,
  inertInfo,
  overrideList,
  queryList,
  updateInfo,
  updatePlayedInfo,
  updatePositionInfo,
} from './dbHelper'
import type { ListMusicInfo, PlayedInfo } from './statements'

let playList: AnyListen.Player.PlayMusicInfo[] | null = null

const toDBList = (list: AnyListen.Player.PlayMusicInfo[], offset = 0): ListMusicInfo[] => {
  return list.map((info, index) => {
    return {
      ...info.musicInfo,
      is_local: Number(info.musicInfo.isLocal),
      meta: JSON.stringify(info.musicInfo.meta),

      item_id: info.itemId,
      list_id: info.listId,
      is_online: Number(info.isOnline),
      played: Number(info.played),
      play_later: Number(info.playLater),
      position: offset + index,
    }
  })
}

const initListInfo = (force = false) => {
  if (playList && !force) return
  let list = queryList().sort((a, b) => a.position - b.position)
  playList = []
  for (const info of list) {
    const { item_id, position, list_id, is_online, play_later, played, is_local, meta, ...mInfo } = info
    playList.push({
      musicInfo: {
        ...mInfo,
        isLocal: is_local == 1,
        meta: JSON.parse(meta),
      },
      itemId: item_id,
      listId: list_id,
      isOnline: is_online == 1,
      played: played == 1,
      playLater: play_later == 1,
    })
  }
}

/**
 * 获取播放列表
 * @param id 歌曲id
 * @returns 播放列表
 */
export const getPlayList = (): AnyListen.Player.PlayMusicInfo[] => {
  initListInfo()
  return playList!
}

/**
 * 覆盖播放列表
 */
export const playListOverride = (newList: AnyListen.Player.PlayMusicInfo[]) => {
  let list = toDBList(newList)
  overrideList(list)
  playList = newList
}

/**
 * 批量添加歌曲
 * @param position 位置
 * @param list 信息
 */
export const playListAdd = (position: number, list: AnyListen.Player.PlayMusicInfo[]) => {
  initListInfo()
  if (position < 0 || position >= playList!.length) {
    const newLists: ListMusicInfo[] = toDBList(list, playList!.length)
    inertInfo(newLists)
    playList = arrPush(playList!, list)
  } else {
    const newUserLists = toDBList([...playList!])
    arrPushByPosition(newUserLists, toDBList(list, 0), position)
    newUserLists.forEach((list, index) => {
      list.position = index
    })
    overrideList(newUserLists)
    arrPushByPosition(playList!, list, position)
  }
}

/**
 * 批量删除
 * @param ids ids
 */
export const playListRemove = (ids: string[]) => {
  initListInfo()
  deleteInfo(ids)
  playList = playList!.filter((l) => !ids.includes(l.itemId))
}

/**
 * 批量更新歌曲信息
 * @param list 信息
 */
export const playListUpdate = (info: AnyListen.Player.PlayMusicInfo[]) => {
  initListInfo()
  const musicMap = new Map<string, AnyListen.Player.PlayMusicInfo>()
  for (const music of info) musicMap.set(music.itemId, music)
  const updateInfos: AnyListen.Player.PlayMusicInfo[] = []
  const infos = playList!.filter((i) => {
    const update = musicMap.has(i.itemId)
    if (update) updateInfos.push(i)
    return update
  })
  if (!infos.length) return
  const dbList: ListMusicInfo[] = toDBList(updateInfos, 0)
  updateInfo(dbList)
  for (const oInfo of infos) {
    const info = musicMap.get(oInfo.itemId)!
    oInfo.musicInfo.name = info.musicInfo.name
    oInfo.musicInfo.singer = info.musicInfo.singer
    oInfo.musicInfo.isLocal = info.musicInfo.isLocal
    oInfo.musicInfo.interval = info.musicInfo.interval
    oInfo.musicInfo.meta = info.musicInfo.meta
  }
}

/**
 * 批量更新播放状态
 * @param position 位置
 * @param ids ids
 */
export const playListUpdatePlayed = (played: boolean, ids: string[]) => {
  initListInfo()
  const dbPlayed = Number(played)
  updatePlayedInfo(ids.map((id) => ({ item_id: id, played: dbPlayed })))
  for (const info of playList!) {
    if (ids.includes(info.itemId)) info.played = played
  }
}

/**
 * 批量更新播放状态
 * @param position 位置
 * @param ids ids
 */
export const playListUpdatePlayedAll = (played: boolean) => {
  initListInfo()
  const dbPlayed = Number(played)
  let update = false
  let dbList: PlayedInfo[] = []
  for (const info of playList!) {
    if (info.played == played) continue
    update ||= true
    dbList.push({ item_id: info.itemId, played: dbPlayed })
  }
  if (!update) return
  updatePlayedInfo(dbList)
  for (const info of playList!) {
    info.played = played
  }
}

/**
 * 批量更新位置
 * @param position 位置
 * @param ids ids
 */
export const playListUpdatePosition = (position: number, ids: string[]) => {
  initListInfo()
  const newList = [...playList!]

  const updateInfos: AnyListen.Player.PlayMusicInfo[] = []

  for (let i = newList.length - 1; i >= 0; i--) {
    if (ids.includes(newList[i].itemId)) {
      const list = newList.splice(i, 1)[0]
      updateInfos.push(list)
    }
  }
  position = Math.min(newList.length, position)

  arrPushByPosition(newList, updateInfos, position)
  updatePositionInfo(newList.map((l, i) => ({ item_id: l.itemId, position: i })))
  playList = newList
}

/**
 * 清空播放列表
 */
export const playListClear = () => {
  if (!playList?.length) return
  playList = []
  clearList()
}
