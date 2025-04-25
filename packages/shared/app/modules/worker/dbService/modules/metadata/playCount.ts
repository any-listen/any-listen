import { getDB } from '../../db'

/**
 * 获取播放统计
 * @returns 播放统计
 */
export const queryMetadataPlayCount = () => {
  const db = getDB()
  const result = db
    .prepare(
      `
    SELECT "field_name", "field_value"
    FROM "main"."metadata"
    WHERE "field_name"='play_count' OR "field_name"='play_time'
  `
    )
    .all() as [{ field_name: 'play_count'; field_value: string }, { field_name: 'play_time'; field_value: string }]
  const info = { count: 0, time: 0 }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  for (const { field_name, field_value } of result) {
    if (field_name == 'play_count') info.count = parseInt(field_value)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    else if (field_name == 'play_time') info.time = parseInt(field_value)
  }
  console.log(info)
  return info
}
/**
 * 更新播放次数
 */
export const updateMetadataPlayCount = (count?: number) => {
  const db = getDB()
  count ??=
    parseInt(
      (
        (db
          .prepare(
            `
      SELECT "field_value"
      FROM "main"."metadata"
      WHERE "field_name"='play_count'
    `
          )
          .get() as { field_value: string } | null) ?? { field_value: '0' }
      ).field_value
    ) + 1
  db.prepare<[string]>(
    `
    UPDATE "main"."metadata"
    SET "field_value"=?
    WHERE "field_name"='play_count'
  `
  ).run(String(count))
}
/**
 * 更新播放时长
 */
export const updateMetadataPlayTime = (time: number, isAdd = true) => {
  const db = getDB()
  if (isAdd) {
    time =
      parseInt(
        (
          (db
            .prepare(
              `
      SELECT "field_value"
      FROM "main"."metadata"
      WHERE "field_name"='play_time'
    `
            )
            .get() as { field_value: string } | null) ?? { field_value: '0' }
        ).field_value
      ) + time
  }
  db.prepare<[string]>(
    `
    UPDATE "main"."metadata"
    SET "field_value"=?
    WHERE "field_name"='play_time'
  `
  ).run(String(time))
}
