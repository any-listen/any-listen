import { getDB } from '../../db'

interface PlayListInfo {
  listId: null | string
  isOnline: boolean
}
let playListInfo: PlayListInfo
const initPlayListInfo = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (playListInfo !== undefined) return
  const db = getDB()
  const result = db
    .prepare(
      `
    SELECT "field_value"
    FROM "main"."metadata"
    WHERE "field_name"='play_list_id'
  `
    )
    .get() as { field_value: string } | null
  const data = result?.field_value
  if (data) {
    try {
      const result = JSON.parse(data) as PlayListInfo
      if (typeof result != 'object') throw new Error('not object')
      playListInfo = result
      return
    } catch {}
  }
  playListInfo = {
    listId: null,
    isOnline: false,
  }
}
/**
 * 获取播放列表id
 */
export const queryMetadataPlayListInfo = () => {
  initPlayListInfo()
  return playListInfo
}
/**
 * 保存播放列表id
 * @param id
 */
export const saveMetadataPlayListInfo = (id: string | null, isOnline: boolean) => {
  if (playListInfo.listId == id) return
  playListInfo.listId = id
  playListInfo.isOnline = isOnline
  const db = getDB()
  db.prepare<[string | null]>(
    `
    INSERT INTO "main"."metadata" ("field_name", "field_value")
    VALUES ('play_list_id', ?)
  `
  ).run(JSON.stringify(playListInfo))
}
