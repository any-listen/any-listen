import path from 'node:path'

import { DEV_SERVER_PORTS } from '@any-listen/common/constants'
import { getPlatform, isLinux, isWin } from '@any-listen/nodejs/index'
import { BrowserWindow, Notification, dialog, session } from 'electron'

import { appState } from '@/app'
import { collectMusic, uncollectMusic } from '@/modules/player'
import { themeState } from '@/modules/theme'
import { encodePath } from '@/shared/electron'
import { openDevTools as handleOpenDevTools, throttle } from '@/shared/utils'

import { winMainEvent } from './event'
import { rendererIPC } from './rendererEvent'
import { createTaskBarButtons, getWindowSizeInfo } from './utils'

let browserWindow: Electron.BrowserWindow | null = null

const winEvent = () => {
  if (!browserWindow) return

  browserWindow.on('close', (event) => {
    if (appState.isSkipTrayQuit || !appState.appSetting['tray.enable']) {
      browserWindow!.setProgressBar(-1)
      winMainEvent.close()
      return
    }

    event.preventDefault()
    browserWindow!.hide()
  })

  browserWindow.on('closed', () => {
    browserWindow = null
  })

  // browserWindow.on('restore', () => {
  //   browserWindow.webContents.send('restore')
  // })
  browserWindow.on('focus', () => {
    winMainEvent.focus()
  })

  browserWindow.on('blur', () => {
    winMainEvent.blur()
  })

  browserWindow.once('ready-to-show', () => {
    showWindow()
    setThumbarButtons()
    winMainEvent.ready_to_show()
  })

  browserWindow.on('show', () => {
    winMainEvent.show()

    // 修复隐藏窗口后再显示时任务栏按钮丢失的问题
    setThumbarButtons()
  })
  browserWindow.on('hide', () => {
    winMainEvent.hide()
  })
}

export const createWindow = () => {
  closeWindow()
  const windowSizeInfo = getWindowSizeInfo(appState.appSetting['common.windowSizeId'])

  const theme = themeState
  const ses = session.fromPartition('persist:view-main')
  if (appState.proxy.host) {
    void ses.setProxy({
      proxyRules: `http://${appState.proxy.host}:${appState.proxy.port}`,
    })
  }

  const preloadUrl = path.join(encodePath(__dirname), './view-main.preload.js')

  /**
   * Initial window options
   */
  const options: Electron.BrowserWindowConstructorOptions = {
    height: windowSizeInfo.height,
    useContentSize: true,
    width: windowSizeInfo.width,
    frame: false,
    transparent: !appState.envParams.cmdParams.dt,
    hasShadow: appState.envParams.cmdParams.dt,
    // enableRemoteModule: false,
    // icon: join(appState.__static, isWin ? 'icons/256x256.ico' : 'icons/512x512.png'),
    roundedCorners: appState.envParams.cmdParams.dt,
    resizable: false,
    maximizable: false,
    fullscreenable: true,
    show: false,
    webPreferences: {
      preload: preloadUrl,
      session: ses,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      webSecurity: false,
      nodeIntegration: false,
      sandbox: false,
      enableWebSQL: false,
      webgl: false,
      spellcheck: false, // 禁用拼写检查器
    },
  }
  if (import.meta.env.VITE_IS_MAC) {
    options.frame = true
    options.titleBarStyle = 'hidden'
    options.trafficLightPosition = { x: 12, y: 8 }
  }
  if (appState.envParams.cmdParams.dt) options.backgroundColor = theme.colors['--color-primary-light-1000']
  if (appState.appSetting['common.startInFullscreen']) {
    options.fullscreen = true
    if (isLinux) options.resizable = true
  }
  browserWindow = new BrowserWindow(options)

  const winURL = import.meta.env.DEV
    ? `http://localhost:${DEV_SERVER_PORTS['view-main']}`
    : `file://${path.join(encodePath(__dirname), '../view-main/index.html')}`
  if (import.meta.env.DEV) {
    void browserWindow.loadURL(`${winURL}?os=${getPlatform()}&dt=${appState.envParams.cmdParams.dt}`)
  } else {
    void browserWindow.loadURL(
      `${winURL}?os=${getPlatform()}&dt=${appState.envParams.cmdParams.dt}&t=${encodeURIComponent(JSON.stringify(theme.colors))}`
    )
  }

  winEvent()

  if (appState.envParams.cmdParams.odt) handleOpenDevTools(browserWindow.webContents)

  // browserWindow.webContents.openDevTools()
}

export const isExistWindow = (): boolean => !!browserWindow
export const isShowWindow = (): boolean => {
  if (!browserWindow) return false
  return browserWindow.isVisible() && (isWin ? true : browserWindow.isFocused())
}

export const closeWindow = () => {
  if (!browserWindow) return
  browserWindow.close()
}

export const setProxy = (host: string, port: string) => {
  if (!browserWindow) return
  if (host) {
    void browserWindow.webContents.session.setProxy({
      proxyRules: `http://${host}:${port}`,
    })
  } else {
    void browserWindow.webContents.session.setProxy({
      proxyRules: '',
    })
  }
}

export const showSelectDialog = async (options: Electron.OpenDialogOptions) => {
  if (!browserWindow) throw new Error('main window is undefined')
  return dialog.showOpenDialog(browserWindow, options)
}
export const showDialog = ({ type, message, detail }: Electron.MessageBoxSyncOptions) => {
  if (!browserWindow) return
  dialog.showMessageBoxSync(browserWindow, {
    type,
    message,
    detail,
  })
}
export const minimize = () => {
  if (!browserWindow) return
  browserWindow.minimize()
}
export const maximize = () => {
  if (!browserWindow) return
  browserWindow.maximize()
}
export const unmaximize = () => {
  if (!browserWindow) return
  browserWindow.unmaximize()
}
export const toggleHide = () => {
  if (!browserWindow) return
  browserWindow.isVisible() ? browserWindow.hide() : browserWindow.show()
}
export const toggleMinimize = () => {
  if (!browserWindow) return
  if (browserWindow.isVisible()) {
    if (browserWindow.isMinimized()) browserWindow.restore()
    else browserWindow.minimize()
  } else browserWindow.show()
}
export const showWindow = () => {
  if (!browserWindow) return
  if (browserWindow.isVisible()) {
    if (browserWindow.isMinimized()) browserWindow.restore()
    else browserWindow.focus()
  } else browserWindow.show()
}
export const hideWindow = () => {
  if (!browserWindow) return
  browserWindow.hide()
}
export const setWindowBounds = (options: Partial<Electron.Rectangle>) => {
  if (!browserWindow) return
  browserWindow.setBounds(options)
}
export const setProgressBar = (progress: number, options?: Electron.ProgressBarOptions) => {
  if (!browserWindow) return
  browserWindow.setProgressBar(progress, options)
}
export const setIgnoreMouseEvents = (ignore: boolean, options?: Electron.IgnoreMouseEventsOptions) => {
  if (!browserWindow) return
  browserWindow.setIgnoreMouseEvents(ignore, options)
}
export const toggleDevTools = () => {
  if (!browserWindow) return
  if (browserWindow.webContents.isDevToolsOpened()) {
    browserWindow.webContents.closeDevTools()
  } else {
    handleOpenDevTools(browserWindow.webContents)
  }
}

export const setFullScreen = (isFullscreen: boolean): boolean => {
  if (!browserWindow) return false
  if (isLinux) {
    // linux 需要先设置为可调整窗口大小才能全屏
    if (isFullscreen) {
      browserWindow.setResizable(isFullscreen)
      browserWindow.setFullScreen(isFullscreen)
    } else {
      browserWindow.setFullScreen(isFullscreen)
      browserWindow.setResizable(isFullscreen)
    }
  } else {
    browserWindow.setFullScreen(isFullscreen)
  }
  return isFullscreen
}

const taskBarButtonFlags: AnyListen.TaskBarButtonFlags = {
  empty: true,
  collect: false,
  play: false,
  next: true,
  prev: true,
}
export const setThumbarButtons = throttle(
  ({ empty, collect, play, next, prev }: AnyListen.TaskBarButtonFlags = taskBarButtonFlags) => {
    if (!isWin || !browserWindow) return
    taskBarButtonFlags.empty = empty
    taskBarButtonFlags.collect = collect
    taskBarButtonFlags.play = play
    taskBarButtonFlags.next = next
    taskBarButtonFlags.prev = prev
    browserWindow.setThumbarButtons(
      createTaskBarButtons(taskBarButtonFlags, (action) => {
        switch (action) {
          case 'collect':
            void collectMusic()
            break
          case 'unCollect':
            void uncollectMusic()
            break
          default:
            void rendererIPC.playerAction({ action })
            break
        }
      })
    )
  },
  50
)

export const setThumbnailClip = (region: Electron.Rectangle) => {
  if (!browserWindow) return
  browserWindow.setThumbnailClip(region)
}

export const clearCache = async () => {
  if (!browserWindow) throw new Error('main window is undefined')
  await browserWindow.webContents.session.clearCache()
}

export const getCacheSize = async () => {
  if (!browserWindow) throw new Error('main window is undefined')
  return browserWindow.webContents.session.getCacheSize()
}

export const getWebContents = () => {
  // if (!browserWindow) throw new Error('main window is undefined')
  return browserWindow?.webContents
}

/** 展示通知窗口 */
export const showNotification = async (title: string, message: string) => {
  if (!Notification.isSupported()) throw new Error('Notification is not supported')
  const notify = new Notification({
    title,
    body: message,
    icon: '',
  })
  notify.show()
}

/** 显示消息弹窗 */
export const showMessageBox = async (options: { type: Electron.MessageBoxOptions['type']; title: string; message: string }) => {
  if (!browserWindow) throw new Error('main window is undefined')
  return dialog.showMessageBox(browserWindow, options)
}

/** 显示错误消息弹窗 */
export const showErrorBox = (title: string, message: string) => {
  dialog.showErrorBox(title, message)
}

/** 显示打开弹窗 */
export const showOpenDialog = async (options: {
  title: Electron.OpenDialogOptions['title']
  defaultPath?: Electron.OpenDialogOptions['defaultPath']
  buttonLabel?: Electron.OpenDialogOptions['buttonLabel']
  filters?: Electron.OpenDialogOptions['filters']
  properties?: Electron.OpenDialogOptions['properties']
}) => {
  if (!browserWindow) throw new Error('main window is undefined')
  return dialog.showOpenDialog(browserWindow, options)
}

/** 显示保存弹窗 */
export const showSaveDialog = async (options: {
  title: Electron.SaveDialogOptions['title']
  defaultPath?: Electron.SaveDialogOptions['defaultPath']
  buttonLabel?: Electron.SaveDialogOptions['buttonLabel']
  filters?: Electron.SaveDialogOptions['filters']
  properties?: Electron.SaveDialogOptions['properties']
}) => {
  if (!browserWindow) throw new Error('main window is undefined')
  return dialog.showSaveDialog(browserWindow, options)
}
