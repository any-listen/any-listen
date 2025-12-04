import path from 'node:path'
// import { log } from '@/shared/log'
import { i18n } from '@/app/i18n'
import { appLog } from '@/shared/log4js'
import { startDBServiceWorker as _startDBServiceWorker, workers } from '@any-listen/app/modules/worker'
import { DB_NAME } from '@any-listen/common/constants'
import { getNativeName } from '@any-listen/nodejs'
import { backupDB } from '@any-listen/nodejs/tools'

const initServices = async (dataPath: string) => {
  let nativeBindingPath = `../native/${getNativeName()}/better_sqlite3.node`
  if (import.meta.env.DEV) nativeBindingPath = '../node_modules/better-sqlite3/build/Release/better_sqlite3.node'

  let dbFileExists = await workers.dbService.init(dataPath, nativeBindingPath)
  if (dbFileExists === null) {
    const backupPath = path.join(dataPath, `${DB_NAME}.${Date.now()}.bak`)
    appLog.warn(i18n.t('database_verify_failed'))
    appLog.warn(i18n.t('database_verify_failed_detail', { backupPath }))
    backupDB(dataPath, backupPath)
    await workers.dbService.init(dataPath, nativeBindingPath)
  }
}

export const startDBServiceWorker = async (dataPath: string) => {
  return new Promise<void>((resolve, reject) => {
    void _startDBServiceWorker(() => {
      initServices(dataPath).then(resolve).catch(reject)
    }).catch(reject)
  })
}
