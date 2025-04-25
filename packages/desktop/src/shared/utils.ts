import { log } from '@/shared/log'
import { checkPath } from '@any-listen/nodejs/index'
import fs from 'fs'
export * from '@any-listen/common/utils'
export * from '@any-listen/nodejs/index'

/**
 * 读取配置文件
 * @returns
 */
export const parseDataFile = async <T>(filePath: string): Promise<T | null> => {
  if (await checkPath(filePath)) {
    try {
      return JSON.parse((await fs.promises.readFile(filePath)).toString()) as T
    } catch (err) {
      log.error(err)
    }
  }
  return null
}

export const openDevTools = (webContents: Electron.WebContents) => {
  webContents.openDevTools({
    mode: 'undocked',
  })
}
