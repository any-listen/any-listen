import { openDirInExplorer } from '@/shared/electron'
import { dialog } from 'electron'
import { renameSync } from 'fs'
import path from 'path'
// import { log } from '@/shared/log'
import { i18n } from '@/i18n'
import { startDBServiceWorker as _startDBServiceWorker, workers } from '@any-listen/app/modules/worker'

// let nativeBindingPath = '../../node_modules/better-sqlite3/build/Release/better_sqlite3.node'
let nativeBindingPath = './native/better_sqlite3.node'

if (import.meta.env.DEV) nativeBindingPath = '../../build-config/tempLib/better_sqlite3.node'

const initServices = async (dataPath: string) => {
  let dbFileExists = await workers.dbService.init(dataPath, nativeBindingPath)
  if (dbFileExists === null) {
    const backPath = path.join(dataPath, `anylisten.data.db.${Date.now()}.bak`)
    dialog.showMessageBoxSync({
      type: 'warning',
      message: i18n.t('database_verify_failed'),
      detail: i18n.t('database_verify_failed_detail', { backPath }),
    })
    renameSync(path.join(dataPath, 'anylisten.data.db'), backPath)
    openDirInExplorer(backPath)
    dbFileExists = await workers.dbService.init(dataPath, nativeBindingPath)
  }
}

export const startDBServiceWorker = async (dataPath: string) =>
  new Promise<void>((resolve, reject) => {
    void _startDBServiceWorker(() => {
      initServices(dataPath).then(resolve).catch(reject)
    }).catch(reject)
  })
