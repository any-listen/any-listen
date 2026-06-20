import path from 'node:path'

import { DEV_SERVER_PORTS } from '@any-listen/common/constants'
import { getPlatform, isLinux, isWin } from '@any-listen/nodejs/index'
import { BrowserWindow, session } from 'electron'

import { appState, updateSetting } from '@/app'
import { themeState } from '@/modules/theme'
import { encodePath } from '@/shared/electron'
import { debounce } from '@/shared/utils'

import { winLyricEvent } from './event'
import { initWindowSize, minHeight, minWidth } from './utils'

let browserWindow: Electron.BrowserWindow | null = null
let isWinBoundsUpdateing = false

const saveBoundsConfig = debounce((config: Partial<AnyListen.AppSetting>) => {
  updateSetting(config)
  isWinBoundsUpdateing &&= false
}, 500)

const winEvent = () => {
  if (!browserWindow) return

  // browserWindow.on('close', () => {
  //   if (appState.appSetting['desktopLyric.enable'] && !appState.mainWindowClosed) {
  //     browserWindow = null
  //     appState.event_app.update_config({ 'desktopLyric.enable': false })
  //   }
  // })

  browserWindow.on('closed', () => {
    browserWindow = null
  })

  browserWindow.on('move', () => {
    // bounds = browserWindow.getBounds()
    // console.log('move', isWinBoundsUpdateing)
    if (isWinBoundsUpdateing) {
      const bounds = browserWindow!.getBounds()
      saveBoundsConfig({
        'desktopLyric.x': bounds.x,
        'desktopLyric.y': bounds.y,
        'desktopLyric.width': bounds.width,
        'desktopLyric.height': bounds.height,
      })
    } else if (isWin) {
      // Linux 不允许将窗口设置出屏幕之外，MacOS未知，故只在Windows下执行强制设置
      // 非主动调整窗口触发的窗口位置变化将重置回设置值
      browserWindow!.setBounds({
        x: appState.appSetting['desktopLyric.x'] ?? 0,
        y: appState.appSetting['desktopLyric.y'] ?? 0,
        width: appState.appSetting['desktopLyric.width'],
        height: appState.appSetting['desktopLyric.height'],
      })
    }
  })

  browserWindow.on('resize', () => {
    // bounds = browserWindow.getBounds()
    // console.log(bounds)
    isWinBoundsUpdateing = true
    const bounds = browserWindow!.getBounds()
    saveBoundsConfig({
      'desktopLyric.x': bounds.x,
      'desktopLyric.y': bounds.y,
      'desktopLyric.width': bounds.width,
      'desktopLyric.height': bounds.height,
    })
  })

  // browserWindow.on('restore', () => {
  //   browserWindow.webContents.send('restore')
  // })
  // browserWindow.on('focus', () => {
  //   browserWindow.webContents.send('focus')
  // })

  browserWindow.once('ready-to-show', () => {
    showWindow()
    if (appState.appSetting['desktopLyric.isLock']) {
      browserWindow!.setIgnoreMouseEvents(true, { forward: !isLinux && appState.appSetting['desktopLyric.isHoverHide'] })
    }
    // linux下每次重开时貌似要重新设置置顶
    // if (isLinux && appState.appSetting['desktopLyric.isAlwaysOnTop']) {
    //   browserWindow!.setAlwaysOnTop(appState.appSetting['desktopLyric.isAlwaysOnTop'], 'screen-saver')
    // }
    if (appState.appSetting['desktopLyric.isAlwaysOnTop'] && appState.appSetting['desktopLyric.isAlwaysOnTopLoop']) {
      alwaysOnTopTools.startLoop()
    }
    browserWindow?.blur()
  })
}

export const createWindow = () => {
  closeWindow()
  if (!appState.envParams.workAreaSize) return
  let x = appState.appSetting['desktopLyric.x']
  let y = appState.appSetting['desktopLyric.y']
  let width = appState.appSetting['desktopLyric.width']
  let height = appState.appSetting['desktopLyric.height']
  let isAlwaysOnTop = appState.appSetting['desktopLyric.isAlwaysOnTop']
  // let isLockScreen = appState.appSetting['desktopLyric.isLockScreen']
  let isShowTaskbar = appState.appSetting['desktopLyric.isShowTaskbar']
  // let { width: screenWidth, height: screenHeight } = appState.envParams.workAreaSize
  const winSize = initWindowSize(x, y, width, height)
  updateSetting({
    'desktopLyric.x': winSize.x,
    'desktopLyric.y': winSize.y,
    'desktopLyric.width': winSize.width,
    'desktopLyric.height': winSize.height,
  })

  const theme = themeState
  const ses = session.fromPartition('persist:view-lyric')
  if (appState.proxy.host) {
    void ses.setProxy({
      proxyRules: `http://${appState.proxy.host}:${appState.proxy.port}`,
    })
  }

  const preloadUrl = path.join(encodePath(__dirname), './view-lyric.preload.js')

  /**
   * Initial window options
   */
  const options: Electron.BrowserWindowConstructorOptions = {
    height: winSize.height,
    width: winSize.width,
    x: winSize.x,
    y: winSize.y,
    minWidth,
    minHeight,

    useContentSize: true,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: isWin,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    roundedCorners: false,
    show: false,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: !isShowTaskbar,
    webPreferences: {
      preload: preloadUrl,
      session: ses,
      contextIsolation: false,
      webSecurity: false,
      sandbox: false,
      nodeIntegration: false,
      enableWebSQL: false,
      webgl: false,
      spellcheck: false, // 禁用拼写检查器
      backgroundThrottling: false,
    },
  }

  /**
   * Initial window options
   */
  browserWindow = new BrowserWindow(options)

  const winURL = import.meta.env.DEV
    ? `http://localhost:${DEV_SERVER_PORTS['view-lyric']}`
    : `file://${path.join(encodePath(__dirname), '../view-lyric/index.html')}`
  if (import.meta.env.DEV) {
    void browserWindow.loadURL(`${winURL}?os=${getPlatform()}&dt=${appState.envParams.cmdParams.dt}`)
  } else {
    void browserWindow.loadURL(
      `${winURL}?os=${getPlatform()}&dt=${appState.envParams.cmdParams.dt}&t=${encodeURIComponent(JSON.stringify(theme.colors))}`
    )
  }

  winEvent()
  // browserWindow.webContents.openDevTools()
  winLyricEvent.created(browserWindow)
}
export const isExistWindow = (): boolean => !!browserWindow

export const closeWindow = () => {
  if (!browserWindow) return
  browserWindow.destroy()
  // browserWindow.close()
}

export const showWindow = () => {
  if (!browserWindow) return
  browserWindow.show()
}

export const setResizeable = (isResizeable: boolean) => {
  if (!browserWindow) return
  browserWindow.setResizable(isResizeable)
}

export const getBounds = (): Electron.Rectangle | null => {
  if (!browserWindow) return null
  return browserWindow.getBounds()
}

export const setBounds = (bounds: Electron.Rectangle) => {
  if (!browserWindow) return
  isWinBoundsUpdateing = true
  browserWindow.setBounds(bounds)
}

export const setIgnoreMouseEvents = (ignore: boolean, options?: Electron.IgnoreMouseEventsOptions) => {
  if (!browserWindow) return
  browserWindow.setIgnoreMouseEvents(ignore, options)
}

export const setSkipTaskbar = (skip: boolean) => {
  if (!browserWindow) return
  browserWindow.setSkipTaskbar(skip)
}

export const setAlwaysOnTop = (
  flag: boolean,
  level?: 'normal' | 'floating' | 'torn-off-menu' | 'modal-panel' | 'main-menu' | 'status' | 'pop-up-menu' | 'screen-saver',
  relativeLevel?: number
) => {
  if (!browserWindow) return
  browserWindow.setAlwaysOnTop(flag, level, relativeLevel)
}

export const getMainFrame = (): Electron.WebFrameMain | null => {
  if (!browserWindow) return null
  return browserWindow.webContents.mainFrame
}

export const getWebContents = () => {
  // if (!browserWindow) throw new Error('main window is undefined')
  return browserWindow?.webContents
}

interface AlwaysOnTopTools {
  timeout: NodeJS.Timeout | null
  setAlwaysOnTop: (isLoop: boolean) => void
  startLoop: () => void
  clearLoop: () => void
}
export const alwaysOnTopTools: AlwaysOnTopTools = {
  timeout: null,
  setAlwaysOnTop(isLoop) {
    this.clearLoop()
    setAlwaysOnTop(appState.appSetting['desktopLyric.isAlwaysOnTop'], 'screen-saver')
    // console.log(isLoop)
    if (isLoop) this.startLoop()
  },
  startLoop() {
    this.clearLoop()
    this.timeout = setInterval(() => {
      if (!isExistWindow()) {
        this.clearLoop()
        return
      }
      setAlwaysOnTop(true, 'screen-saver')
    }, 500)
  },
  clearLoop() {
    if (!this.timeout) return
    clearInterval(this.timeout)
    this.timeout = null
  },
}
