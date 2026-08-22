import path from 'node:path'

import { startDBServiceWorker as _startDBServiceWorker, workers } from '@any-listen/app/modules/worker'
import { DB_NAME } from '@any-listen/common/constants'
import { dialog } from 'electron'

import { appState } from '@/app'
// import { log } from '@/shared/log'
import { i18n } from '@/i18n'
import { openDirInExplorer } from '@/shared/electron'

const initServices = async (dataPath: string) => {
  let nativeBindingPath = './native/better_sqlite3.node'
  if (import.meta.env.DEV) nativeBindingPath = '../../node_modules/better-sqlite3/build/Release/better_sqlite3.node'

  let dbFileExists = await workers.dbService.init(
    dataPath,
    nativeBindingPath,
    appState.machineId,
    appState.appSetting['backup.backupPath']
  )
  if (dbFileExists === null) {
    const backupPath = path.join(dataPath, `${DB_NAME}.${Date.now()}.bak`)
    dialog.showMessageBoxSync({
      type: 'warning',
      message: i18n.t('database_verify_failed'),
      detail: i18n.t('database_verify_failed_detail', { backupPath }),
    })
    await workers.dbService.backupDB(dataPath, nativeBindingPath, backupPath)
    openDirInExplorer(backupPath)
    await workers.dbService.init(dataPath, nativeBindingPath, appState.machineId, appState.appSetting['backup.backupPath'])
  }
}

export const startDBServiceWorker = async (dataPath: string) => {
  return new Promise<void>((resolve, reject) => {
    void _startDBServiceWorker(() => {
      initServices(dataPath).then(resolve).catch(reject)
    }).catch(reject)
  })
}
