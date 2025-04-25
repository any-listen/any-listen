import { getDB } from '../../db'

let playInfo: AnyListen.Player.SavedPlayInfo | undefined
const init = () => {
  if (playInfo !== undefined) return
  const db = getDB()
  const result = db
    .prepare(
      `
    SELECT "field_value"
    FROM "main"."metadata"
    WHERE "field_name"='play_info'
  `
    )
    .get() as { field_value: string } | null
  const data = result?.field_value
  if (data) {
    try {
      const result = JSON.parse(data) as AnyListen.Player.SavedPlayInfo
      playInfo = result
      return
    } catch {}
  }
  playInfo = {
    index: -1,
    time: 0,
    maxTime: 0,
    historyIndex: -1,
  }
}
/**
 * 获取播放信息
 */
export const queryMetadataPlayInfo = () => {
  init()
  return playInfo!
}
/**
 * 保存播放信息
 * @param id
 */
export const saveMetadataPlayInfo = (info: AnyListen.Player.SavedPlayInfo) => {
  playInfo = info
  const db = getDB()
  db.prepare<[string | null]>(
    `
    INSERT INTO "main"."metadata" ("field_name", "field_value")
    VALUES ('play_info', ?)
  `
  ).run(JSON.stringify(playInfo))
}
