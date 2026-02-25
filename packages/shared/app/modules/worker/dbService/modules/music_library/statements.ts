import { LIST_IDS } from '@any-listen/common/constants'

import { dbPrepare } from '../../db'

export interface MusicInfo {
  id: string
  list_id: string
  name: string
  singer: string
  interval: string | null
  is_local: number
  meta: string
  order: number
}

export interface MusicInfoOrder {
  list_id: string
  music_id: string
  order: number
}

export interface MusicInfoQuery {
  list_id: string
}

export interface MusicInfoRemove {
  list_id: string
  id: string
}

export interface ListMusicInfoQuery {
  list_id: string
  music_id: string
}

export interface UserListInfo {
  id: string
  parent_id: string | null
  name: string
  type: string
  meta: string
  position: number
}

/**
 * 创建所有默认列表查询语句
 * @returns 查询语句
 */
export const createDefaultListQueryStatement = () => {
  return dbPrepare<[], UserListInfo>(`
    SELECT "id", "parent_id", "name", "type", "meta", "position"
    FROM "main"."my_list"
    WHERE "type"=='${LIST_IDS.DEFAULT}'
    `)
}

/**
 * 创建所有用户列表查询语句
 * @returns 查询语句
 */
export const createAllUserListQueryStatement = () => {
  return dbPrepare<[], UserListInfo>(`
    SELECT "id", "parent_id", "name", "type", "meta", "position"
    FROM "main"."my_list"
    WHERE "type"!='${LIST_IDS.DEFAULT}'
    ORDER BY position ASC
    `)
}

/**
 * 创建单个列表查询语句
 * @returns 查询语句
 */
// export const createListQueryStatement = () => {
//   return dbPrepare<UserListInfo'parent_id']]>(`
//     SELECT "id", "parent_id", "name", "type", "meta", "position"
//     FROM "main"."my_list"
//     WHERE "id"=?
//     `)
// }

/**
 * 创建子列表查询语句
 * @returns 查询语句
 */
// export const createSubListQueryStatement = () => {
//   return dbPrepare<UserListInfo'parent_id']]>(`
//     SELECT "id", "parent_id", "name", "type", "meta", "position"
//     FROM "main"."my_list"
//     WHERE "parent_id"=?
//     ORDER BY position ASC
//     `)
// }

/**
 * 创建列表插入语句
 * @returns 插入语句
 */
export const createListInsertStatement = () => {
  return dbPrepare<UserListInfo>(`
    INSERT INTO "main"."my_list" ("id", "parent_id", "name", "type", "meta", "position")
    VALUES (@id, @parent_id, @name, @type, @meta, @position)`)
}

/**
 * 创建列表清空语句
 * @returns 清空语句
 */
export const createListClearStatement = () => {
  return dbPrepare<NonNullable<UserListInfo['parent_id']>>(`
    DELETE FROM "main"."my_list"
    WHERE "parent_id"=? AND "type"!='${LIST_IDS.DEFAULT}'
  `)
}

/**
 * 创建列表清空语句
 * @returns 清空语句
 */
export const createListClearNullStatement = () => {
  return dbPrepare(`
    DELETE FROM "main"."my_list"
    WHERE "parent_id" IS NULL AND "type"!='${LIST_IDS.DEFAULT}'
  `)
}

/**
 * 创建全部列表清空语句
 * @returns 清空语句
 */
export const createListClearAllStatement = () => {
  return dbPrepare(`DELETE FROM "main"."my_list" WHERE "type"!='${LIST_IDS.DEFAULT}'`)
}

/**
 * 创建列表删除语句
 * @returns 删除语句
 */
export const createListDeleteStatement = () => {
  return dbPrepare<string>(`DELETE FROM "main"."my_list" WHERE "id"=? AND "type"!='${LIST_IDS.DEFAULT}'`)
}

/**
 * 创建列表更新语句
 * @returns 更新语句
 */
export const createListUpdateStatement = () => {
  return dbPrepare<UserListInfo>(`
    UPDATE "main"."my_list"
    SET "name"=@name, "meta"=@meta
    WHERE "id"=@id`)
}

/**
 * 创建音乐信息查询语句
 * @returns 查询语句
 */
export const createMusicInfoQueryStatement = () => {
  return dbPrepare<MusicInfoQuery, MusicInfo>(`
    SELECT mInfo."id", mInfo."name", mInfo."singer", mInfo."is_local", mInfo."interval", mInfo."meta"
    FROM my_list_music_info mInfo
    LEFT JOIN my_list_music_info_order O
    ON mInfo.id=O.music_id AND O.list_id=@list_id
    WHERE mInfo.list_id=@list_id
    ORDER BY O."order" ASC
    `)
}

/**
 * 创建音乐查询语句
 * @returns 查询语句
 */
export const createListMusicInfoQueryStatement = () => {
  return dbPrepare<ListMusicInfoQuery, MusicInfo>(`
    SELECT mInfo."id", mInfo."name", mInfo."singer", mInfo."is_local", mInfo."interval", mInfo."meta"
    FROM my_list_music_info mInfo
    WHERE mInfo.list_id=@list_id AND mInfo.id=@music_id
    `)
}

/**
 * 创建音乐信息插入语句
 * @returns 插入语句
 */
export const createMusicInfoInsertStatement = () => {
  return dbPrepare<MusicInfo>(`
    INSERT INTO "main"."my_list_music_info" ("id", "list_id", "name", "singer", "is_local", "interval", "meta")
    VALUES (@id, @list_id, @name, @singer, @is_local, @interval, @meta)`)
}

/**
 * 创建音乐信息更新语句
 * @returns 更新语句
 */
export const createMusicInfoUpdateStatement = () => {
  return dbPrepare<MusicInfo>(`
    UPDATE "main"."my_list_music_info"
    SET "name"=@name, "singer"=@singer, "is_local"=@is_local, "interval"=@interval, "meta"=@meta
    WHERE "id"=@id AND "list_id"=@list_id`)
}

/**
 * 创建清空音乐信息语句
 * @returns 删除语句
 */
export const createMusicInfoClearStatement = () => {
  return dbPrepare('DELETE FROM "main"."my_list_music_info"')
}

/**
 * 创建根据列表id批量删除音乐信息语句
 * @returns 删除语句
 */
export const createMusicInfoDeleteByListIdStatement = () => {
  return dbPrepare<string>('DELETE FROM "main"."my_list_music_info" WHERE "list_id"=?')
}

/**
 * 创建根据列表Id与音乐id批量删除音乐信息语句
 * @returns 删除语句
 */
export const createMusicInfoDeleteStatement = () => {
  return dbPrepare<MusicInfoRemove>('DELETE FROM "main"."my_list_music_info" WHERE "id"=@id AND "list_id"=@list_id')
}

/**
 * 创建根据列表Id与音乐id查询音乐信息语句
 * @returns 删除语句
 */
export const createMusicInfoByListAndMusicInfoIdQueryStatement = () => {
  return dbPrepare<ListMusicInfoQuery, MusicInfo>(`SELECT "id", "name", "singer", "is_local", "interval", "meta"
    FROM "main"."my_list_music_info"
    WHERE "id"=@music_id
    AND "list_id"=@list_id`)
}

/**
 * 创建根据音乐id查询音乐信息语句
 * @returns 删除语句
 */
export const createMusicInfoByMusicInfoIdQueryStatement = () => {
  return dbPrepare<string, MusicInfo>(`SELECT "id", "name", "singer", "is_local", "interval", "meta", "list_id"
    FROM "main"."my_list_music_info"
    WHERE "id"=?`)
}

/**
 * 创建音乐信息排序插入语句
 * @returns 插入语句
 */
export const createMusicInfoOrderInsertStatement = () => {
  return dbPrepare<MusicInfoOrder>(`
    INSERT INTO "main"."my_list_music_info_order" ("list_id", "music_id", "order")
    VALUES (@list_id, @music_id, @order)`)
}

/**
 * 创建清空音乐排序语句
 * @returns 删除语句
 */
export const createMusicInfoOrderClearStatement = () => {
  return dbPrepare('DELETE FROM "main"."my_list_music_info_order"')
}

/**
 * 创建根据列表id删除音乐排序语句
 * @returns 删除语句
 */
export const createMusicInfoOrderDeleteByListIdStatement = () => {
  return dbPrepare<string>('DELETE FROM "main"."my_list_music_info_order" WHERE "list_id"=?')
}

/**
 * 创建根据列表Id与音乐id删除音乐排序语句
 * @returns 删除语句
 */
export const createMusicInfoOrderDeleteStatement = () => {
  return dbPrepare<MusicInfoRemove>('DELETE FROM "main"."my_list_music_info_order" WHERE "music_id"=@id AND "list_id"=@list_id')
}
