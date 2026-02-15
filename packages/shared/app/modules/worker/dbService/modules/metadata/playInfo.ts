import { dbPrepare } from '../../db'

let playInfo: AnyListen.Player.SavedPlayInfo | undefined
const init = () => {
  if (playInfo !== undefined) return
  const result = dbPrepare<[], { field_value: string }>(`
    SELECT "field_value"
    FROM "main"."metadata"
    WHERE "field_name"='play_info'
  `).get()
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
    lastTrackId: null,
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
  dbPrepare<string>(
    `
    INSERT INTO "main"."metadata" ("field_name", "field_value")
    VALUES ('play_info', ?)
  `
  ).run(JSON.stringify(playInfo))
}
