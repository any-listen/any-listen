import { createCache } from '@any-listen/common/cache'
import { toMD5, readFile, writeFile, normalizePath, dirname } from '@any-listen/nodejs'
import { createProxyCallback } from 'message2call'

import { extensionState } from '../state'
import { cloneData } from './shared'

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
      if (data.length) {
        if (!openDirs) openDirs = createCache<string>({ ttl: 30 * 60 * 1000 }) // 30 minutes
        for (const path of data) openDirs.set(`content://${toMD5(path)}`, path)
      }
      return cloneData(data)
    },
    async showSaveBox(key: string, options: AnyListen.IPCCommon.SaveDialogOptions) {
      const data = await extensionState.remoteFuncs.showSaveBox(key, extension.id, cloneData(options))
      if (data) {
        if (!saveDirs) saveDirs = createCache<string>({ ttl: 30 * 60 * 1000 }) // 30 minutes
        saveDirs.set(`content://${toMD5(data)}`, data)
      }
      return cloneData(data)
    },
    async closeMessageBox(key: string) {
      return extensionState.remoteFuncs.closeMessageBox(key)
    },
    async readOpenBoxFile(path: string, format?: 'utf-8' | 'binary') {
      const rawPath = openDirs?.get(path)
      if (!rawPath) throw new Error('Not Allowed to access this file')
      return readFile(rawPath, format)
    },
    async writeSaveBoxFile(dir: string, name: string, content: string | Uint8Array) {
      const rawPath = saveDirs?.get(dir)
      if (!rawPath) throw new Error('Not Allowed to access this file')
      if (name.length > 128) throw new Error('File name is too long')
      const path = normalizePath(`${rawPath}/${name}`)
      const dirPath = dirname(path)
      if (rawPath !== dirPath) throw new Error('Not Allowed to access this file')
      await writeFile(path, content)
      return path
    },
  } as const
}
