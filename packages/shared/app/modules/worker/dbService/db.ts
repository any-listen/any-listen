import path from 'node:path'

import { DB_NAME, LIST_IDS } from '@any-listen/common/constants'
import Database from 'better-sqlite3'

import migrateData from './migrate'
import tables, { DB_VERSION } from './tables'
import verifyDB from './verifyDB'

let db: Database.Database

const initTables = (db: Database.Database) => {
  let now = Date.now()
  let defaultMetadata = `{"playCount":0,"playTime":0,"createTime":${now},"updateTime":0,"posTime":0}`
  db.exec(`
    ${Array.from(tables.values()).join('\n')}
    INSERT INTO "main"."metadata" ("field_name", "field_value") VALUES
      ('db_version', '${DB_VERSION}'),
      ('play_count', '0'),
      ('play_time', '0');
    INSERT INTO "main"."my_list" ("id", "name", "type", "parent_id", "meta", "position") VALUES
      ('${LIST_IDS.DEFAULT}', 'default', '${LIST_IDS.DEFAULT}', null, '${defaultMetadata}', 0),
      ('${LIST_IDS.LOVE}', 'love', '${LIST_IDS.DEFAULT}', null, '${defaultMetadata}', 0),
      ('${LIST_IDS.LAST_PLAYED}', 'last_played', '${LIST_IDS.DEFAULT}', null, '${defaultMetadata}', 0);
  `)
}

// 打开、初始化数据库
export const init = async (dataPath: string, nativeBindingPath: string): Promise<boolean | null> => {
  const databasePath = path.join(dataPath, DB_NAME)
  const nativeBinding = path.join(__dirname, nativeBindingPath)
  let dbFileExists = true

  try {
    db = new Database(databasePath, {
      fileMustExist: true,
      nativeBinding,
      // verbose: process.env.NODE_ENV !== 'production' ? console.log : undefined,
    })
  } catch (error) {
    console.log(error)
    db = new Database(databasePath, {
      nativeBinding,
      // verbose: process.env.NODE_ENV !== 'production' ? console.log : undefined,
    })
    initTables(db)
    dbFileExists = false
  }
  db.pragma('journal_mode = WAL')

  if (dbFileExists) migrateData(db)

  // https://www.sqlite.org/pragma.html#pragma_optimize
  // TODO: Scheduled exec, backup
  if (dbFileExists) db.exec('PRAGMA optimize;')
  if (!verifyDB(db)) {
    db.close()
    return null
  }

  // https://www.sqlite.org/lang_vacuum.html
  // db.exec('VACUUM "main"')

  process.on('exit', () => db.close())
  console.log('db inited')
  // require('./test')
  return dbFileExists
}

// 获取数据库实例
export const getDB = (): Database.Database => db
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const dbPrepare = <T extends {} | unknown[] = [], R = undefined>(sql: string) => {
  return db.prepare<T, R>(sql)
}
