import { generateId } from '@any-listen/common/utils'
import { WebDAVClient } from '@any-listen/nodejs/webdav-client'

import { getSettings } from '../../../common'
import { logs } from '../../logs'
import { CONSTANTS } from './shared'

export interface WebDAVClientOptions {
  url: string
  username: string
  password?: string
  path: string
}

export class WebDAV {
  private readonly webDAVClient: WebDAVClient
  private lockFileName: string | null = null
  private readonly path: string
  constructor(options: WebDAVClientOptions) {
    this.path = options.path
    this.webDAVClient = new WebDAVClient({
      baseUrl: options.url,
      username: options.username,
      password: options.password,
      onError(err) {
        logs.WebdavSync.logcat.error(err)
      },
      async onDebugLog(logMessage) {
        // void debugLog(logMessage)
        // console.log('Sync WebDAVClient debugLog', logMessage)
        if (getSettings()['sync.webdav.debugEnable']) {
          logs.WebdavSync.logcat.debug(logMessage)
        }
      },
    })
  }

  getWebDAVClient() {
    return this.webDAVClient
  }

  async checkConnection() {
    try {
      await this.webDAVClient.ls()
      return null
    } catch (err) {
      logs.WebdavSync.logcat.error(err)
      return err as Error
    }
  }

  async checkCurrentLock() {
    const files = await this.ls()
    const file = files.find((f) => f.name === this.lockFileName)
    return !!file
  }

  async checkLocked() {
    const files = await this.ls()
    let file = files.find((f) => f.name.startsWith(CONSTANTS.lockFilePrefix))
    if (!file) return false
    const time = parseInt(file.name.replace(CONSTANTS.lockFilePrefix, ''))
    if (isNaN(time)) return false
    const now = Date.now()
    if (now - time > 1000 * 60 * 2) {
      void this.rm(file.name) // remove lock file if it is expired
      // lock file is older than 2 minutes, consider it expired
      return false
    }
    return true
  }

  private async handleLock() {
    const now = Date.now()
    const lockFileName = `${CONSTANTS.lockFilePrefix}${now}-${generateId()}`
    await this.put(lockFileName, '')
    const files = await this.ls() // wait for the lock file to be created
    for (const file of files) {
      if (file.name.startsWith(CONSTANTS.lockFilePrefix) && file.name !== lockFileName) {
        const time = parseInt(file.name.replace(CONSTANTS.lockFilePrefix, ''))
        if (isNaN(time)) continue
        if (now > time) {
          await this.rm(lockFileName)
          return false
        }
      }
    }
    this.lockFileName = lockFileName
    return true
  }

  lock(onEnd: (locked: boolean, error?: Error) => void) {
    let cancelled = false
    let timer: NodeJS.Timeout | null = null
    const lock = async () => {
      const locked = await this.checkLocked().catch((err: Error) => {
        logs.WebdavSync.logcat.error(err)
        onEnd(false, err)
        throw err
      })
      if (!locked) {
        if (cancelled) {
          onEnd(false)
          return
        }
        const locked = await this.handleLock().catch((err: Error) => {
          logs.WebdavSync.logcat.error(err)
          onEnd(false, err)
          throw err
        })
        if (locked) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (cancelled) {
            await this.unlock().catch(() => {})
            onEnd(false)
            return
          }
          onEnd(true)
          return
        }
        onEnd(false)
      }
      logs.WebdavSync.logcat.info('Other locks detected, retrying in 2 seconds...')
      timer = setTimeout(() => {
        timer = null
        void lock()
      }, 2000)
    }

    void lock()
    return () => {
      cancelled = true
      if (timer) {
        clearTimeout(timer)
        onEnd(false)
      }
    }
  }

  async unlock() {
    let files = await this.ls()
    files = files.filter((f) => f.name.startsWith(CONSTANTS.lockFilePrefix))
    if (files.length) {
      for (const file of files) {
        if (file.name === this.lockFileName) {
          await this.rm(file.name)
          break
        }
      }
    }
  }

  async put(path: string, data: Buffer | string) {
    return this.webDAVClient.putData(`${this.path}/${path}`, data)
  }

  async rm(path: string) {
    return this.webDAVClient.rm(`${this.path}/${path}`)
  }

  async get(path: string) {
    return this.webDAVClient.get(`${this.path}/${path}`)
  }

  async ls(path?: string) {
    return this.webDAVClient.ls(path ? `${this.path}/${path}` : this.path)
  }

  async mkdir(path: string) {
    return this.webDAVClient.mkdir(`${this.path}/${path}`)
  }
}

export { is404Error } from '@any-listen/nodejs/webdav-client'
