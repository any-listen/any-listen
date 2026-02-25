import fs from 'node:fs'
import path from 'node:path'

import Store from '@any-listen/nodejs/Store'
// import { writeFileSync } from 'atomically'
import { dialog, shell } from 'electron'

import { appState } from '@/app'
import { log } from '@/shared/log'

const stores = new Map<string, Store>()

/**
 * 获取 Store 对象
 * @param name store 名
 * @param isIgnoredError 是否忽略错误
 * @param isShowErrorAlert=true 是否显示错误弹窗
 * @returns Store
 */
export default (name: string, isIgnoredError = true, isShowErrorAlert = true): Store => {
  if (stores.has(name)) return stores.get(name)!
  let store: Store
  const storePath = path.join(appState.dataPath, `${name}.json`)
  try {
    stores.set(name, (store = new Store(storePath, false)))
  } catch (err) {
    const error = err as Error
    log.error(error)

    if (!isIgnoredError) throw error

    const backPath = `${storePath}.bak`
    fs.renameSync(storePath, backPath)
    if (isShowErrorAlert) {
      dialog.showMessageBoxSync({
        type: 'error',
        message: `${name} data load error`,
        detail: `We have helped you back up the old ${name} file to: ${backPath}\nYou can try to repair and restore it manually\n\nError detail: ${error.message}`,
      })
      shell.showItemInFolder(backPath)
    }

    store = new Store(storePath, true)
  }
  return store
}

export type { Store }
