import { dbPrepare } from '../../db'

export interface MusicInfoOtherSource {
  source_id: string
  id: string
  name: string
  singer: string
  interval: string | null
  meta: string
  time: number
  order: number
}

/**
 * 创建歌曲信息查询语句
 * @returns 查询语句
 */
export const createMusicInfoQueryStatement = () => {
  return dbPrepare<string, MusicInfoOtherSource>(`
    SELECT "id", "name", "singer", "interval", "meta", "time"
    FROM "main"."music_info_other_source"
    WHERE source_id=?
    ORDER BY "order" ASC
  `)
}

/**
 * 创建歌曲信息插入语句
 * @returns 插入语句
 */
export const createMusicInfoInsertStatement = () => {
  return dbPrepare<MusicInfoOtherSource>(`
    INSERT INTO "main"."music_info_other_source" ("id", "name", "singer", "interval", "meta", "source_id", "time", "order")
    VALUES (@id, @name, @singer, @interval, @meta, @source_id, @time, @order)
  `)
}

/**
 * 创建歌曲信息清空语句
 * @returns 清空语句
 */
export const createMusicInfoClearStatement = () => {
  return dbPrepare(`
    DELETE FROM "main"."music_info_other_source"
  `)
}

/**
 * 创建歌曲信息删除语句
 * @returns 删除语句
 */
export const createMusicInfoDeleteStatement = () => {
  return dbPrepare<string>(`
    DELETE FROM "main"."music_info_other_source"
    WHERE "source_id"=?
  `)
}

/**
 * 创建数量统计语句
 * @returns 统计语句
 */
export const createCountStatement = () => {
  return dbPrepare<[], { count: number }>('SELECT COUNT(*) as count FROM "main"."music_info_other_source"')
}
