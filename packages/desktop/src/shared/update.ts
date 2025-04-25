import { getLatestVersion } from '@any-listen/common/tools'
import { appState } from '../app'
import { checkUpdate, downloadUpdate, initUpdate, restartUpdate } from './electronUpdate'
import { request } from './request'
import { compareVersions, sleep } from './utils'

interface EventTypes {
  checking_for_update: never
  update_available: AnyListen.UpdateInfo
  update_not_available: AnyListen.UpdateInfo
  download_progress: AnyListen.DownloadProgressInfo
  update_downloaded: never
  error: Error
  ignore_version: string | null
}

type Listener = (event: unknown) => void
class UpdateEvent {
  private readonly listeners: Map<keyof EventTypes, Listener[]>
  constructor() {
    this.listeners = new Map()
  }
  off<T extends keyof EventTypes>(eventName: T, listener: (event: EventTypes[T]) => void) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) return
    const index = targetListeners.indexOf(listener as Listener)
    if (index < 0) return
    targetListeners.splice(index, 1)
  }
  on<T extends keyof EventTypes>(eventName: T, listener: (event: EventTypes[T]) => void) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) this.listeners.set(eventName, (targetListeners = []))
    targetListeners.push(listener as Listener)
    return () => {
      this.off(eventName, listener as Listener)
    }
  }
  emit<T extends keyof EventTypes>(eventName: T, ...[event]: EventTypes[T] extends never ? [] : [event: EventTypes[T]]) {
    setImmediate(() => {
      let targetListeners = this.listeners.get(eventName)
      if (!targetListeners) return
      for (const listener of Array.from(targetListeners)) {
        listener(event)
      }
    })
  }
}

const enName = 'YW55LWxpc3Rlbg=='
const name = Buffer.from(enName, 'base64').toString()
const pkgName = `${name}-desktop`
const address = [
  [`https://raw.githubusercontent.com/${name}/${name}/main/packages/desktop/publish/version.json`, 'direct'],
  [`https://registry.npmjs.org/@${name}/${pkgName}/latest`, 'npm'],
  [`https://cdn.jsdelivr.net/gh/${name}/${name}/packages/desktop/publish/version.json`, 'direct'],
  [`https://fastly.jsdelivr.net/gh/${name}/${name}/packages/desktop/publish/version.json`, 'direct'],
  [`https://gcore.jsdelivr.net/gh/${name}/${name}/packages/desktop/publish/version.json`, 'direct'],
  [`https://registry.npmmirror.com/@${name}/${pkgName}/latest`, 'npm'],
  ['http://cdn.stsky.cn/any-listen/desktop/version.json', 'direct'],
] as const

const getDirectInfo = async (url: string) => {
  return request<Partial<AnyListen.UpdateInfo>>(url).then(({ body }) => {
    if (body.version == null) throw new Error('failed')
    return body as AnyListen.UpdateInfo
  })
}

const getNpmPkgInfo = async (url: string) => {
  return request<{ versionInfo?: string }>(url).then(({ body }) => {
    if (!body.versionInfo) throw new Error('failed')
    const info = JSON.parse(body.versionInfo) as Partial<AnyListen.UpdateInfo>
    if (info.version == null) throw new Error('failed')
    return info as AnyListen.UpdateInfo
  })
}
export const getUpdateInfo = async (index = 0): Promise<AnyListen.UpdateInfo> => {
  const [url, source] = address[index]
  let promise: Promise<AnyListen.UpdateInfo>
  switch (source) {
    case 'direct':
      promise = getDirectInfo(url)
      break
    case 'npm':
      promise = getNpmPkgInfo(url)
      break
  }

  return promise.catch(async (err: Error) => {
    index++
    if (index >= address.length) throw err
    return getUpdateInfo(index)
  })
}

export class Update extends UpdateEvent {
  initUpdate() {
    initUpdate(this)
  }
  async checkForUpdates(isAutoUpdate: boolean) {
    this.emit('checking_for_update')
    let info: AnyListen.UpdateInfo
    try {
      info = await getUpdateInfo()
    } catch (err) {
      this.emit('error', err as Error)
      return false
    }
    const latest = getLatestVersion(info, appState.appSetting['common.allowPreRelease'])

    if (compareVersions(appState.version.version, latest.version) < 0) {
      this.emit('update_available', info)
      checkUpdate(isAutoUpdate, appState.appSetting['common.allowPreRelease'])
      return true
    }
    this.emit('update_not_available', info)
    return false
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async downloadUpdate() {
    await downloadUpdate()
  }
  async isUpdaterActive() {
    return this.checkForUpdates(false)
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async quitAndInstall() {
    restartUpdate()
  }
}
export const update = new Update()

export const startCheckUpdateTimeout = async (): Promise<void> => {
  await update.checkForUpdates(false).catch(() => {})
  await sleep(86400_000)
  return startCheckUpdateTimeout()
}
