import { exec } from 'node:child_process'
import fs from 'node:fs'

import { checkFile } from '@any-listen/nodejs/index'

import { log } from '@/shared/log'
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

export const openDevTools = (webContents: Electron.WebContents) => {
  webContents.openDevTools({
    mode: 'undocked',
  })
}

export const getWindowsTaskbarTheme = async () => {
  try {
    const output = await new Promise<string>((resolve, reject) => {
      exec(
        'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v SystemUsesLightTheme',
        { encoding: 'utf8' },
        (error, stdout, stderr) => {
          if (error) {
            reject(error)
          } else {
            resolve(stdout)
          }
        }
      )
    })

    const match = /SystemUsesLightTheme\s+REG_DWORD\s+0x([0-9a-f]+)/i.exec(output)

    if (!match) return null

    return parseInt(match[1], 16) === 1 ? 'light' : 'dark'
  } catch {
    return null
  }
}
