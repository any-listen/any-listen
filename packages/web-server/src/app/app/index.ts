import { setProxy } from '@/app/shared/request'
import { startCheckUpdateTimeout, update } from '@/app/shared/update'
import { socketEvent } from '@/modules/ipc/event'
import { appLog } from '@/shared/log4js'
import { checkAndCreateDir, removePath } from '@/shared/utils'
import { parseEnvParams } from '@any-listen/nodejs/env'
import { version } from '../../../package.json'
import { getAppSetting, saveSetting } from './data'
import { appEvent } from './event'
import { appState } from './state'

const initState = () => {
  const envParams = parseEnvParams<AnyListen.CmdParams>()
  appState.envParams = {
    cmdParams: envParams.cmdParams,
  }
  appState.version.version = version
  appState.version.commit = __GIT_COMMIT__ || ''
  appState.version.commitDate = __GIT_COMMIT_DATE__ ? new Date(__GIT_COMMIT_DATE__).getTime() : 0
}

const setUserDataPath = async () => {
  appState.dataPath = `${global.anylisten.dataPath}/app`
  appState.cacheDataPath = `${global.anylisten.dataPath}/cache`
  appState.tempDataPath = `${global.anylisten.dataPath}/temp`
  checkAndCreateDir(appState.dataPath)
  checkAndCreateDir(appState.cacheDataPath)
  await removePath(appState.tempDataPath).catch(() => {})
  checkAndCreateDir(appState.tempDataPath)
}
const listenerAppEvent = () => {
  const handleProxyChange = () => {
    let host: string
    let port: string
    if (appState.appSetting['network.proxy.enable'] && appState.appSetting['network.proxy.host']) {
      host = appState.appSetting['network.proxy.host']
      port = appState.appSetting['network.proxy.port'] || '80'
    } else if (typeof appState.envParams.cmdParams['proxy-server'] == 'string') {
      const [_host, _port] = appState.envParams.cmdParams['proxy-server'].split(':')
      host = _host
      port = _port || '80'
    } else {
      host = ''
      port = ''
    }
    appState.proxy.host = host
    appState.proxy.port = port
    setProxy(host ? `${host}:${port}` : undefined)
    appEvent.proxy_changed(host, port)
  }
  appEvent.on('updated_config', (keys, setting) => {
    if (
      keys.includes('network.proxy.enable') ||
      (appState.appSetting['network.proxy.enable'] && keys.some((k) => k.includes('network.proxy.')))
    ) {
      handleProxyChange()
    }
  })
  appEvent.on('inited', () => {
    void startCheckUpdateTimeout()
  })
  if (appState.appSetting['network.proxy.enable'] && appState.appSetting['network.proxy.host']) handleProxyChange()
  socketEvent.on('new_socket_inited', (socket) => {
    setImmediate(() => {
      appEvent.clientConnected(socket)
    })
  })

  update.on('checking_for_update', () => {
    appState.version.status = 'checking'
  })
  update.on('update_available', (info) => {
    appState.version.isLatest = false
    appState.version.status = 'idle'
    appState.version.newVersion = info
  })
  update.on('update_not_available', (info) => {
    appState.version.isLatest = true
    appState.version.status = 'idle'
    appState.version.newVersion = info
  })
  update.on('error', (err) => {
    console.log(err)
    appState.version.status = 'error'
    appLog.info('Check Update Error:', err)
  })
  update.on('download_progress', (info) => {
    if (appState.version.status != 'downloading') {
      appState.version.status = 'downloading'
    }
    appState.version.progress = info

    let logMessage = `Download speed: ${info.bytesPerSecond}`
    logMessage = `${logMessage} - Downloaded ${info.percent}%`
    logMessage = `${logMessage} (${info.transferred}/${info.total})`
    appLog.info(logMessage)
  })
  update.on('update_downloaded', (info) => {
    appState.version.status = 'downloaded'
  })
  update.on('ignore_version', (version) => {
    appState.version.ignoreVersion = version
  })
}

export const initAppEnv = async () => {
  initState()
  await setUserDataPath()
  appState.appSetting = (await getAppSetting()).setting
  listenerAppEvent()
}

/**
 * 更新配置
 * @param setting 新设置
 */
export const updateSetting = (setting: Partial<AnyListen.AppSetting>) => {
  const { setting: newSetting, updatedSettingKeys, updatedSetting } = saveSetting(setting)
  appState.appSetting = newSetting
  if (!updatedSettingKeys.length) return
  appEvent.updated_config(updatedSettingKeys, updatedSetting)
}

export const sendInitedEvent = () => {
  appEvent.inited()
}

export * as appActions from './actions'

export { appEvent } from './event'
export { appState } from './state'
