import { clearMusicInfo, countMusicInfo, deleteMusicInfo, inertMusicInfo, queryMusicInfo } from './dbHelper'
import type { MusicInfoOtherSource } from './statements'

const toDBMusicInfo = (id: string, musicInfos: AnyListen.Music.MusicInfo[]): MusicInfoOtherSource[] => {
  let now = Date.now()
  return musicInfos.map((info, index) => {
    return {
      id: info.id,
      interval: info.interval,
      name: info.name,
      singer: info.singer,
      meta: JSON.stringify(info.meta),
      source_id: id,
      time: now,
      order: index,
    } satisfies MusicInfoOtherSource
  })
}

/**
 * 获取歌曲信息
 * @param id 歌曲id
 * @returns 歌词信息
 */
export const getMusicInfoOtherSource = (id: string): AnyListen.Music.MusicInfoOnline[] => {
  const list = queryMusicInfo(id)
    .sort((a, b) => a.order - b.order)
    .map((info) => {
      return {
        id: info.id,
        name: info.name,
        singer: info.singer,
        isLocal: false,
        interval: info.interval,
        meta: JSON.parse(info.meta),
      } satisfies AnyListen.Music.MusicInfoOnline
    })

  return list
}

/**
 * 保存歌曲信息信息
 * @param id 歌曲id
 * @param musicInfos 歌词信息
 */
export const musicInfoOtherSourceAdd = (id: string, musicInfos: AnyListen.Music.MusicInfoOnline[]) => {
  inertMusicInfo(toDBMusicInfo(id, musicInfos))
}

/**
 * 删除歌曲信息信息
 * @param ids 歌曲id
 */
export const musicInfoOtherSourceRemove = (ids: string[]) => {
  deleteMusicInfo(ids)
}

/**
 * 清空歌曲信息信息
 */
export const musicInfoOtherSourceClear = () => {
  clearMusicInfo()
}

/**
 * 统计歌曲信息信息数量
 */
export const musicInfoOtherSourceCount = () => {
  return countMusicInfo()
}
