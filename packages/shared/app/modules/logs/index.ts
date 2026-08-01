import fs from 'node:fs'

import { LOG_NAMES } from '@any-listen/common/constants'
import { logFormat } from '@any-listen/common/tools'
import { dateFormat } from '@any-listen/common/utils'
import { checkAndCreateDir, checkFile, joinPath } from '@any-listen/nodejs'
import { createSimpleLogcat, readLastLines } from '@any-listen/nodejs/logs'

import { appLogEvent } from './event'

const createLogcat = (logType: AnyListen.LogType) => {
  let log: ((message: string) => void) | null = null
  const cache: string[] = []
  const sendLog = (type: AnyListen.ExtensionVM.HostCallActions['logcat']['type'], messages: unknown[]) => {
    const info: AnyListen.LogInfo = {
      type,
      timestamp: Date.now(),
      logType,
      message: messages
        .map((m) => (typeof m == 'string' ? m : m instanceof Error ? (m.stack ?? m.message) : JSON.stringify(m)))
        .join(' '),
    }
    if (import.meta.env.DEV) {
      console.log(`[${logType} ${dateFormat(info.timestamp)} ${info.type.toUpperCase()}] ${info.message}`)
    }
    const msg = logFormat(info)
    if (log) {
      log(msg)
    } else {
      cache.push(msg)
    }
    appLogEvent.logOutput(logType, msg)
  }
  let logPath = ''
  let logName = ''

  return {
    init: async (path: string, name: string) => {
      logPath = path
      logName = name
      log = await createSimpleLogcat(logPath, logName)
      if (cache.length > 0) {
        cache.forEach(log)
        cache.length = 0
      }
    },
    logcat: {
      log(...args: unknown[]) {
        sendLog('info', args)
      },
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
    },
    getLogs: async () => {
      if (!logPath) return ''
      return readLastLines(joinPath(logPath, logName), 200)
    },
    clearLog: async () => {
      if (!logPath) return
      const logFile = joinPath(logPath, logName)
      if (await checkFile(logFile)) {
        await fs.promises.writeFile(logFile, '')
      }
      log = await createSimpleLogcat(logPath, logName)
    },
  }
}
export const logs: Record<AnyListen.LogType, ReturnType<typeof createLogcat>> = {
  App: createLogcat('App'),
  ExtensionService: createLogcat('ExtensionService'),
  ProxyService: createLogcat('ProxyService'),
  WebdavSync: createLogcat('WebdavSync'),
}
export const initAppLog = async (dataPath: string) => {
  const logPath = joinPath(dataPath, LOG_NAMES.LOG_DIR)
  await checkAndCreateDir(logPath)
  await logs.App.init(logPath, LOG_NAMES.APP)
  await logs.ExtensionService.init(logPath, LOG_NAMES.EXTENSION_SERVICE)
  await logs.WebdavSync.init(logPath, LOG_NAMES.WEBDAV_SYNC)
}

export { appLogEvent } from './event'
