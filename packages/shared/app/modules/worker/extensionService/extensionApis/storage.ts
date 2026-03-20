import fs from 'node:fs/promises'
import { sep } from 'node:path'

import { EXTENSION } from '@any-listen/common/constants'
import { joinPath, normalizePath } from '@any-listen/nodejs'

export const createStore = (path: string) => {
  const rootPath = joinPath(path, EXTENSION.storageDirName) + sep
  const buildPath = (names: string) => {
    const fullPath = normalizePath(joinPath(rootPath, names))
    if (!fullPath.startsWith(rootPath)) throw new Error('Invalid path')
    return fullPath
  }
  fs.mkdir(rootPath, { recursive: true }).catch(() => {
    // ignore
  })

  return {
    async saveFile(path: string, content: string | Uint8Array) {
      if (typeof path != 'string') throw new Error('path required a string')
      if (typeof content != 'string' && !(content instanceof Uint8Array)) {
        throw new Error('content required a string or Uint8Array')
      }
      await fs.writeFile(buildPath(path), content)
    },
    async readFile(path: string) {
      if (typeof path != 'string') throw new Error('path required a string')
      return fs.readFile(buildPath(path)).then((data) => new Uint8Array(data))
    },
    async removeFile(path: string) {
      if (typeof path != 'string') throw new Error('path required a string')
      await fs.rm(buildPath(path), { recursive: true })
    },
    async fileExists(path: string) {
      if (typeof path != 'string') throw new Error('path required a string')
      try {
        await fs.access(buildPath(path), fs.constants.F_OK)
        return true
      } catch {
        return false
      }
    },
    async listFiles(path = '') {
      if (typeof path != 'string') throw new Error('path required a string')
      const fullPath = buildPath(path)
      return fs.readdir(fullPath)
    },
    async statFile(path: string) {
      if (typeof path != 'string') throw new Error('path required a string')
      const stats = await fs.stat(buildPath(path))
      return {
        isFile: stats.isFile(),
        size: stats.size,
        createTime: stats.birthtimeMs,
        updateTime: stats.mtimeMs,
      }
    },
  }
}
