import { URL_SCHEME_RXP } from '@any-listen/common/constants'
import { app, nativeTheme, screen, shell } from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { appEvent } from './event'
import { appState } from './state'
// import { navigationUrlWhiteList } from '@common/config'
import { parseEnvParams } from '@any-listen/nodejs/env'
import { isMac } from '@any-listen/nodejs/index'

import { log } from '@/shared/log'
import { setProxy } from '@/shared/request'
import { startCheckUpdateTimeout, update } from '@/shared/update'
import { version } from '../../package.json'
import { setSkipTrayQuit } from './actions'
import { getAppSetting, saveSetting } from './data'

export const initState = () => {
  const envParams = parseEnvParams<AnyListen.CmdParams>()
  envParams.cmdParams.dt = !!envParams.cmdParams.dt
  appState.envParams = {
    cmdParams: envParams.cmdParams,
  }
  if (typeof appState.envParams.cmdParams['proxy-server'] == 'string') {
    const [host, port = ''] = appState.envParams.cmdParams['proxy-server'].split(':')
    appState.proxy.host = host
    appState.proxy.port = port
  }

  appState.shouldUseDarkColors = nativeTheme.shouldUseDarkColors
  appState.staticPath = import.meta.env.DEV ? __STATIC_PATH__ : path.join(__dirname, '../static')

  appState.version.version = version
  appState.version.commit = __GIT_COMMIT__ || ''
  appState.version.commitDate = __GIT_COMMIT_DATE__ ? new Date(__GIT_COMMIT_DATE__).getTime() : 0
}

export const initSingleInstanceHandle = () => {
  // 单例应用程序
  if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
  }

  app.on('second-instance', (event, argv, cwd) => {
    let deeplink = ''
    for (const param of argv) {
      if (URL_SCHEME_RXP.test(param)) {
        deeplink = param
        break
      }
    }

    appEvent.second_instance(deeplink)
  })
}

export const applyElectronEnvParams = () => {
  // Is disable hardware acceleration
  if (appState.envParams.cmdParams.dha) app.disableHardwareAcceleration()
  if (appState.envParams.cmdParams.dhmkh) app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling')

  // fix linux transparent fail. https://github.com/electron/electron/issues/25153#issuecomment-843688494
  if (process.platform == 'linux') app.commandLine.appendSwitch('use-gl', 'desktop')

  // https://github.com/electron/electron/issues/22691
  app.commandLine.appendSwitch('wm-window-animations-disabled')

  // https://github.com/electron/electron/issues/38790#issuecomment-1592911862
  app.commandLine.appendSwitch('disable-features', 'WidgetLayering')

  app.commandLine.appendSwitch('--disable-gpu-sandbox')

  // proxy
  if (appState.envParams.cmdParams['proxy-server']) {
    app.commandLine.appendSwitch('proxy-server', appState.envParams.cmdParams['proxy-server'])
    app.commandLine.appendSwitch('proxy-bypass-list', appState.envParams.cmdParams['proxy-bypass-list'] ?? '<local>')
  }
}

export const setUserDataPath = () => {
  // windows平台下如果应用目录下存在 portable 文件夹则将数据存在此文件下
  if (process.platform == 'win32') {
    const portablePath = path.join(path.dirname(app.getPath('exe')), '/portable')
    if (existsSync(portablePath)) {
      app.setPath('appData', portablePath)
      const appDataPath = path.join(portablePath, '/userData')
      if (!existsSync(appDataPath)) mkdirSync(appDataPath)
      app.setPath('userData', appDataPath)
    }
  }

  const userDataPath = app.getPath('userData')
  appState.dataPath = path.join(userDataPath, 'AnyListenDatas')
  if (!existsSync(appState.dataPath)) mkdirSync(appState.dataPath)
}

export const registerDeeplink = () => {
  if (import.meta.env.DEV && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    // console.log(process.execPath, process.argv)
    app.setAsDefaultProtocolClient('anylisten', process.execPath, process.argv.slice(1))
  } else {
    app.setAsDefaultProtocolClient('anylisten')
  }

  // deep link
  app.on('open-url', (event, url) => {
    if (!URL_SCHEME_RXP.test(url)) return
    event.preventDefault()

    appEvent.second_instance(url)
  })
}

export const listenerElectronEvent = () => {
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
      if (import.meta.env.DEV) {
        console.log('navigation to url:', navigationUrl.length > 130 ? `${navigationUrl.substring(0, 130)}...` : navigationUrl)
        return
      }
      // if (!navigationUrlWhiteList.some(url => url.test(navigationUrl))) {
      event.preventDefault()
      //   return
      // }
      console.log('navigation to url:', navigationUrl)
    })
    contents.setWindowOpenHandler(({ url }) => {
      if (!url.startsWith('devtools') && /^https?:\/\//.test(url)) {
        void shell.openExternal(url)
      }
      console.log(url)
      return { action: 'deny' }
    })
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload
      // delete webPreferences.preloadURL

      // Disable Node.js integration
      webPreferences.nodeIntegration = false

      // Verify URL being loaded
      // if (!navigationUrlWhiteList.some(url => url.test(params.src))) {
      event.preventDefault()
      // }
    })

    // disable create dictionary
    // https://github.com/lyswhut/lx-music-desktop/issues/773
    contents.session.setSpellCheckerDictionaryDownloadURL('http://0.0.0.0')
  })

  app.on('activate', () => {
    appEvent.activate()
  })

  app.on('before-quit', () => {
    setSkipTrayQuit(true)
  })

  app.on('window-all-closed', () => {
    if (isMac) return

    app.quit()
  })

  const initScreenParams = () => {
    appState.envParams.workAreaSize = screen.getPrimaryDisplay().workAreaSize
  }
  app.on('ready', () => {
    screen.on('display-metrics-changed', initScreenParams)
    initScreenParams()
  })

  nativeTheme.addListener('updated', () => {
    const shouldUseDarkColors = nativeTheme.shouldUseDarkColors
    if (appState.shouldUseDarkColors == shouldUseDarkColors) return
    appState.shouldUseDarkColors = shouldUseDarkColors
    appEvent.system_theme_change(shouldUseDarkColors)
  })
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
    log.info('Check Update Error:', err)
  })
  update.on('download_progress', (info) => {
    if (appState.version.status != 'downloading') {
      appState.version.status = 'downloading'
    }
    appState.version.progress = info

    let logMessage = `Download speed: ${info.bytesPerSecond}`
    logMessage = `${logMessage} - Downloaded ${info.percent}%`
    logMessage = `${logMessage} (${info.transferred}/${info.total})`
    log.info(logMessage)
  })
  update.on('update_downloaded', (info) => {
    appState.version.status = 'downloaded'
  })
  update.on('ignore_version', (version) => {
    appState.version.ignoreVersion = version
  })
  if (appState.appSetting['network.proxy.enable'] && appState.appSetting['network.proxy.host']) handleProxyChange()
}

export const initAppEnv = async () => {
  initState()
  initSingleInstanceHandle()
  applyElectronEnvParams()
  setUserDataPath()
  registerDeeplink()
  listenerElectronEvent()
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
