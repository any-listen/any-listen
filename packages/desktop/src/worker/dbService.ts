import { openDirInExplorer } from '@/shared/electron'
import { dialog } from 'electron'
import path from 'node:path'
// import { log } from '@/shared/log'
import { i18n } from '@/i18n'
import { startDBServiceWorker as _startDBServiceWorker, workers } from '@any-listen/app/modules/worker'
import { DB_NAME } from '@any-listen/common/constants'
import { backupDB } from '@any-listen/nodejs/tools'

// let nativeBindingPath = '../../node_modules/better-sqlite3/build/Release/better_sqlite3.node'
let nativeBindingPath = './native/better_sqlite3.node'

if (import.meta.env.DEV) nativeBindingPath = '../../build-config/tempLib/better_sqlite3.node'

const initServices = async (dataPath: string) => {
  let dbFileExists = await workers.dbService.init(dataPath, nativeBindingPath)
  if (dbFileExists === null) {
    const backupPath = path.join(dataPath, `${DB_NAME}.${Date.now()}.bak`)
    dialog.showMessageBoxSync({
      type: 'warning',
      message: i18n.t('database_verify_failed'),
      detail: i18n.t('database_verify_failed_detail', { backupPath }),
    })
    backupDB(dataPath, backupPath)
    openDirInExplorer(backupPath)
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
