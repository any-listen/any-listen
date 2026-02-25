import { arrPush } from '@any-listen/common/utils'

import { dbPrepare } from '../../db'

let playHistoryList: AnyListen.IPCPlayer.PlayHistoryListItem[] | undefined
const initPlayHistoryList = () => {
  if (playHistoryList) return
  const result = dbPrepare<[], { field_value: string }>(`
    SELECT "field_value"
    FROM "main"."metadata"
    WHERE "field_name"='play_history_list'
  `).get() as { field_value: string } | null

  if (!result) {
    dbPrepare(`
      INSERT INTO "main"."metadata" ("field_name", "field_value")
      VALUES ('play_history_list', '[]')
    `).run()
    playHistoryList = []
    return
  }
  try {
    playHistoryList = (JSON.parse(result.field_value) as AnyListen.IPCPlayer.PlayHistoryListItem[] | null) ?? []
  } catch (e) {
    playHistoryList = []
  }
}
const savePlayHistoryList = () => {
  dbPrepare<string>(`
    UPDATE "main"."metadata"
    SET "field_value"=?
    WHERE "field_name"='play_history_list'
  `).run(JSON.stringify(playHistoryList))
}
/**
 * 获取播放历史列表
 */
export const queryMetadataPlayHistoryList = () => {
  initPlayHistoryList()
  return playHistoryList!
}

/**
 * 覆盖播放历史列表
 */
export const setMetadataPlayHistoryList = (ids: AnyListen.IPCPlayer.PlayHistoryListItem[]) => {
  initPlayHistoryList()
  if (!playHistoryList!.length && !ids.length) return
  playHistoryList = ids
  savePlayHistoryList()
}

/**
 * 添加播放历史列表
 */
export const addMetadataPlayHistoryList = (ids: AnyListen.IPCPlayer.PlayHistoryListItem[]) => {
  initPlayHistoryList()
  arrPush(playHistoryList!, ids)
  savePlayHistoryList()
}

/**
 * 添加播放历史列表
 */
export const removeMetadataPlayHistoryList = (idxs: number[]) => {
  initPlayHistoryList()
  idxs.sort((a, b) => b - a)
  for (const idx of idxs) playHistoryList!.splice(idx, 1)
  savePlayHistoryList()
}
