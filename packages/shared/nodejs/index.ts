import { NATIVE_VERSION } from '@any-listen/common/constants'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import timers from 'node:timers/promises'
import { gunzip, gzip } from 'node:zlib'

// 重命名 process 防止 vite 转换
export const nodeProcess = process

export const joinPath = (...paths: string[]): string => path.join(...paths)

export const extname = (p: string): string => path.extname(p)
export const basename = (p: string, ext?: string): string => path.basename(p, ext)
export const dirname = (p: string): string => path.dirname(p)
export const isAbsolute = (p: string) => path.isAbsolute(p)

export const tmpdir = () => os.tmpdir()

/**
 * 检查路径是否存在
 * @param path 路径
 * @param read 只检查读取
 */
export const checkPath = async (path: string, read = false) =>
  fs.promises
    .access(path, read ? fs.constants.R_OK : fs.constants.R_OK | fs.constants.W_OK)
    .then(() => true)
    .catch(() => false)

/**
 * 检查文件是否存在
 * @param path 文件路径
 * @returns
 */
export const checkFile = async (path: string) =>
  fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)

export const getFileStats = async (path: string) => fs.promises.stat(path).catch(() => null)
export const renamePath = async (path: string, newPath: string) =>
  fs.promises
    .rename(path, newPath)
    .then(() => true)
    .catch(() => false)

/**
 * 检查路径并创建目录
 * @param path
 * @returns
 */
export const checkAndCreateDir = async (path: string) =>
  fs.promises.access(path, fs.constants.F_OK | fs.constants.W_OK).catch(async (err: NodeJS.ErrnoException) => {
    if (err.code != 'ENOENT') throw err as Error
    return fs.promises.mkdir(path, { recursive: true })
  })

/**
 * 创建文件夹
 * @param path
 * @returns
 */
export const createDir = async (path: string) => {
  return fs.promises.mkdir(path, { recursive: true })
}

export const removePath = async (path: string) =>
  fs.promises.rm(path, { recursive: true }).catch((err: NodeJS.ErrnoException) => {
    if (err.code !== 'ENOENT') throw err
  })

export const removeFile = async (path: string) =>
  new Promise<void>((resolve, reject) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        err.code == 'ENOENT' ? resolve() : reject(err)
        return
      }
      fs.unlink(path, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  })

export const readFile = async (path: string) => fs.promises.readFile(path)

/**
 * 创建 MD5 hash
 * @param {*} str
 */
export const toMD5 = (str: string | Buffer | Uint8Array) => crypto.createHash('md5').update(str).digest('hex')
export const toSha256 = (str: string | Buffer | Uint8Array) => crypto.createHash('sha256').update(str).digest('hex')
export const toSha512 = (str: string | Buffer | Uint8Array) => crypto.createHash('sha512').update(str).digest('hex')

export const randomUUID = () => crypto.randomUUID()

export const gzipData = async (str: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    gzip(str, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

export const gunzipData = async (buf: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    gunzip(buf, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result.toString())
    })
  })
}

/**
 * 保存配置文件
 * @param path 保存路径
 * @param data 数据
 */
export const saveAnyListenConfigFile = async (path: string, data: unknown) => {
  if (!path.endsWith('.alc')) path += '.alc'
  fs.writeFile(path, await gzipData(JSON.stringify(data)), 'binary', (err) => {
    console.log(err)
  })
}

/**
 * 读取配置文件
 * @param path 文件路径
 * @returns 数据
 */
export const readAnyListenConfigFile = async <T>(path: string): Promise<T> => {
  let isJSON = path.endsWith('.json')
  let data: string | Buffer = await fs.promises.readFile(path, isJSON ? 'utf8' : 'binary')
  if (!data) return data as T
  if (!isJSON) data = await gunzipData(Buffer.from(data, 'binary'))
  return JSON.parse(data) as T
}

export const saveStrToFile = async (path: string, str: string | Buffer): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    fs.writeFile(path, str, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

export const b64DecodeUnicode = (str: string): string => {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  // return decodeURIComponent(window.atob(str).split('').map(function(c) {
  //   return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  // }).join(''))

  return Buffer.from(str, 'base64').toString()
}

export const copyFile = async (sourcePath: string, distPath: string) => {
  return fs.promises.cp(sourcePath, distPath, {
    recursive: true,
  })
}

export const moveFile = async (sourcePath: string, distPath: string) => {
  return fs.promises.rename(sourcePath, distPath)
}

export const createDirSync = (path: string) => {
  if (!fs.existsSync(path)) {
    try {
      fs.mkdirSync(path, { recursive: true })
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error('Could not set up log directory, error was: ', e)
        process.exit(1)
      }
    }
  }
}

export const checkAndCreateDirSync = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

export const sleep = timers.setTimeout

export const isLinux = process.platform == 'linux'
export const isWin = process.platform == 'win32'
export const isMac = process.platform == 'darwin'
export const isProd = process.env.NODE_ENV == 'production'
export const getPlatform = (platform: NodeJS.Platform = process.platform) => {
  switch (platform) {
    case 'win32':
      return 'windows'
    case 'darwin':
      return 'mac'
    default:
      return 'linux'
  }
}

export const getNativeName = () => {
  return `${process.platform}_${process.arch}_${process.versions.modules}_v${NATIVE_VERSION}`
}
