import { log } from '@/app/shared/log'
import { checkFile } from '@any-listen/nodejs/index'
import fs from 'node:fs'
import { version } from '../../../package.json' with { type: 'json' }
import { bannerMini } from './constants'
export * from '@any-listen/common/utils'
export * from '@any-listen/nodejs/index'

/**
 * 读取配置文件
 * @returns
 */
export const parseDataFile = async <T>(filePath: string): Promise<T | null> => {
  if (await checkFile(filePath)) {
    try {
      return JSON.parse((await fs.promises.readFile(filePath)).toString()) as T
    } catch (err) {
      log.error(err)
    }
  }
  return null
}

export const printLogo = () => {
  const len = Math.max(...bannerMini.split('\n').map((e) => e.length))
  const vStr = `v${version}`
  const sstr = ' '.repeat(Math.max(0, Math.trunc((len - vStr.length) / 2)))
  console.log(`${bannerMini}\n\n${sstr}${vStr}${sstr}`)
}
