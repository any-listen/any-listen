import { createCache } from '@any-listen/common/cache'
import { cloneData } from '@any-listen/common/utils'
import { toMD5, readFile, writeFile, normalizePath, dirname, basename, sep } from '@any-listen/nodejs'
import { createProxyCallback } from 'message2call'

import { extensionState } from '../state'

export const createCommon = (extension: AnyListen.Extension.Extension) => {
  let openDirs: ReturnType<typeof createCache<string>>
  let saveDirs: ReturnType<typeof createCache<string>>

  return {
    async showMessageBox(key: string, options: AnyListen.IPCCommon.MessageDialogOptions) {
      const data = await extensionState.remoteFuncs.showMessageBox(key, extension.id, cloneData(options))
      return cloneData(data)
    },
    async showInputBox(key: string, { validateInput, ...opts }: AnyListen.IPCCommon.InputDialogOptions) {
      const validateInputCallback = validateInput ? createProxyCallback(validateInput) : undefined
      const data = await extensionState.remoteFuncs
        .showInputBox(key, extension.id, cloneData(opts), validateInputCallback)
        .finally(() => {
          validateInputCallback?.releaseProxy()
        })
      return cloneData(data)
    },
    async showOpenBox(key: string, options: AnyListen.IPCCommon.OpenDialogOptions) {
      const data = await extensionState.remoteFuncs.showOpenBox(key, extension.id, cloneData(options))
      if (!data.length) return []
      if (!openDirs) openDirs = createCache<string>({ ttl: 30 * 60 * 1000 }) // 30 minutes
      const paths: string[] = []
      for (const path of data) {
        const vpath = `content://${basename(path)}`
        paths.push(vpath)
        openDirs.set(vpath, path)
      }
      return paths
    },
    async showSaveBox(key: string, options: AnyListen.IPCCommon.SaveDialogOptions) {
      const dir = await extensionState.remoteFuncs.showSaveBox(key, extension.id, cloneData(options))
      if (!dir) return dir
      if (!saveDirs) saveDirs = createCache<string>({ ttl: 30 * 60 * 1000 }) // 30 minutes
      const vdir = `content://${toMD5(dir)}`
      saveDirs.set(vdir, dir)
      return vdir
    },
    async closeMessageBox(key: string) {
      return extensionState.remoteFuncs.closeMessageBox(key)
    },
    async readOpenBoxFile<T extends 'utf-8' | 'binary' = 'binary'>(path: string, format?: T) {
      const rawPath = openDirs?.get(path)
      if (!rawPath) throw new Error('Not Allowed to access this file')
      switch (format) {
        case 'binary':
        case 'utf-8':
          break
        default:
          throw new Error('Invalid format')
      }
      return readFile(rawPath, format) as Promise<T extends 'utf-8' ? string : Uint8Array>
    },
    async writeSaveBoxFile(dir: string, name: string, content: string | Uint8Array) {
      let rawPath = saveDirs?.get(dir)
      if (!rawPath) throw new Error('Not Allowed to access this file')
      if (!rawPath.endsWith(sep)) rawPath += sep
      const path = normalizePath(`${rawPath}${name}`)
      const dirPath = dirname(path)
      if (rawPath !== dirPath) throw new Error('Not Allowed to access this file')
      await writeFile(path, content)
      return path
    },
  } as const
}
