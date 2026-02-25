import { EXTENSION } from '@any-listen/common/constants'
import { logFormat } from '@any-listen/common/tools'
import { dateFormat, generateId } from '@any-listen/common/utils'
import { createSimpleLogcat } from '@any-listen/nodejs/logs'

import { extensionEvent } from '../event'
import type { createCommon } from '../extensionApis/common'

export const createLogTools = async (extension: AnyListen.Extension.Extension) => {
  const log = await createSimpleLogcat(extension.dataDirectory, EXTENSION.logFileName)
  const sendLog = (type: AnyListen.ExtensionVM.HostCallActions['logcat']['type'], messages: unknown[]) => {
    const info = {
      type,
      timestamp: Date.now(),
      id: extension.id,
      name: extension.name,
      message: messages
        .map((m) => (typeof m == 'string' ? m : m instanceof Error ? (m.stack ?? m.message) : JSON.stringify(m)))
        .join(' '),
    }
    if (import.meta.env.DEV) {
      console.log(`[ExtensionHost ${dateFormat(info.timestamp)} ${info.type.toUpperCase()} - ${info.id}] ${info.message}`)
    }
    log(logFormat(info))
    extensionEvent.logOutput(info)
  }
  return {
    debug(...args: unknown[]) {
      sendLog('debug', args)
    },
    info(...args: unknown[]) {
      sendLog('info', args)
    },
    warn(...args: unknown[]) {
      sendLog('warn', args)
    },
    error(...args: unknown[]) {
      sendLog('error', args)
    },
  } as const
}

export const createBoxs = (common: ReturnType<typeof createCommon>) => {
  const keys = new Set<string>()
  const buildKey = async <T>(run: (key: string) => Promise<T>, signal?: AbortSignal) => {
    const key = generateId()
    keys.add(key)
    if (signal) {
      signal.addEventListener('abort', () => {
        if (!keys.has(key)) return
        void common.closeMessageBox(key)
      })
    }
    return run(key).finally(() => {
      keys.delete(key)
    })
  }
  return {
    async showMessage(
      message: string,
      { signal, ...options }: AnyListen.IPCCommon.MessageDialogOptions & { signal?: AbortSignal } = {}
    ) {
      return buildKey(async (key) => {
        return common.showMessageBox(key, { ...options, detail: message })
      }, signal)
    },
    async showInputBox({ signal, ...options }: AnyListen.IPCCommon.InputDialogOptions & { signal?: AbortSignal }) {
      return buildKey(async (key) => {
        return common.showInputBox(key, options)
      }, signal)
    },
    async showOpenDialog({ signal, ...options }: AnyListen.IPCCommon.OpenDialogOptions & { signal?: AbortSignal }) {
      return buildKey(async (key) => {
        return common.showOpenBox(key, options) as Promise<string | string[] | undefined>
      }, signal)
    },
    async showSaveDialog({ signal, ...options }: AnyListen.IPCCommon.SaveDialogOptions & { signal?: AbortSignal }) {
      return buildKey(async (key) => {
        return common.showSaveBox(key, options) as Promise<string | undefined>
      }, signal)
    },
  }
}

export { createConfigurationStore } from '../extensionApis/configuration'
