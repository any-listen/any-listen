import type Database from 'better-sqlite3'

import {
  queryLocalMusicInfo as queryLocalMusicInfoByList,
  updateLocalMusicInfo as updateLocalMusicInfoByList,
} from './modules/music_library/dbHelper'
import {
  queryLocalMusicInfo as queryLocalMusicInfoByPlayList,
  updateLocalMusicInfo as updateLocalMusicInfoByPlayList,
} from './modules/play_list/dbHelper'
import tables, { DB_VERSION } from './tables'

const updateDBVersion = (db: Database.Database) => {
  db.prepare('UPDATE "main"."metadata" SET "field_value"=@value WHERE "field_name"=@name').run({
    name: 'db_version',
    value: DB_VERSION,
  })
}
const migrateV1 = (db: Database.Database) => {
  const sql = `
    BEGIN TRANSACTION;
    -- 1. rename old table
    ALTER TABLE play_list_music_info RENAME TO play_list_music_info_old;

    -- 2. create new table
    ${tables.get('play_list_music_info')}

    -- 3. data migration
    INSERT INTO play_list_music_info (item_id, position, played, play_later, id, list_id, name, singer, interval, is_local, meta, source)
    SELECT item_id, position, played, play_later, id, list_id, name, singer, interval, is_local, meta, 0 AS source
    FROM play_list_music_info_old;

    -- 4. drop old table
    DROP TABLE play_list_music_info_old;
    COMMIT;
  `
  db.exec(sql)
}
const migrateV2 = (machineId: string) => {
  // db.prepare('')
  const list = queryLocalMusicInfoByList()
  for (const item of list) {
    const meta = JSON.parse(item.meta) as { deviceId?: string }
    meta.deviceId ||= machineId
    item.meta = JSON.stringify(meta)
  }
  updateLocalMusicInfoByList(list)
  const plist = queryLocalMusicInfoByPlayList()
  for (const item of plist) {
    const meta = JSON.parse(item.meta) as { deviceId?: string }
    meta.deviceId ||= machineId
    item.meta = JSON.stringify(meta)
  }
  updateLocalMusicInfoByPlayList(plist)
}

export default (db: Database.Database, machineId: string) => {
  // PRAGMA user_version = x
  // console.log(db.prepare('PRAGMA user_version').get().user_version)
  // https://github.com/WiseLibs/better-sqlite3/issues/668#issuecomment-1145285728
  const dbVersion = (
    db.prepare<[string]>('SELECT "field_value" FROM "main"."metadata" WHERE "field_name" = ?').get('db_version') as {
      field_value: string
    }
  ).field_value
  switch (dbVersion) {
    case '1':
      migrateV1(db)
    // fall through
    case '2':
      migrateV2(machineId)
    // fall through
    case '3':
      db.transaction(() => {
        // Recreate the table using the canonical definition so verifyDB also
        // accepts databases upgraded from v3 (it compares the stored SQL).
        db.exec(`
          ALTER TABLE download_list RENAME TO download_list_old;
          ${tables.get('download_list')}
          INSERT INTO download_list (
            id, is_complate, status, status_text, progress_downloaded, progress_total,
            url, quality, ext, file_name, file_path, music_info, position
          )
          SELECT id, is_complate, status, status_text, progress_downloaded, progress_total,
            url, quality, ext, file_name, file_path, music_info, position
          FROM download_list_old;
          DROP TABLE download_list_old;
        `)
        updateDBVersion(db)
      })()
      break
  }
}
