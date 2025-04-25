import { appState, updateSetting } from '@/app'
import { themeState } from '@/modules/theme'
import { encodePath } from '@/shared/electron'
import { mainSend } from '@/shared/mainIpc'
import { debounce, isLinux, isWin } from '@/shared/utils'
import { BrowserWindow } from 'electron'
import path from 'node:path'
import { initWindowSize } from './utils'

// require('./event')
// require('./rendererEvent')

let browserWindow: Electron.BrowserWindow | null = null
let isWinBoundsUpdateing = false

const saveBoundsConfig = debounce((config: Partial<AnyListen.AppSetting>) => {
  updateSetting(config)
  isWinBoundsUpdateing &&= false
}, 500)

const winEvent = () => {
  if (!browserWindow) return

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
    browserWindow!.blur()
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
  // let { width: screenWidth, height: screenHeight } = global.envParams.workAreaSize
  const winSize = initWindowSize(x, y, width, height)
  updateSetting({
    'desktopLyric.x': winSize.x,
    'desktopLyric.y': winSize.y,
    'desktopLyric.width': winSize.width,
    'desktopLyric.height': winSize.height,
  })

  const { shouldUseDarkColors, theme } = themeState

  /**
   * Initial window options
   */
  browserWindow = new BrowserWindow({
    height: winSize.height,
    width: winSize.width,
    x: winSize.x,
    y: winSize.y,
    minWidth: 380,
    minHeight: 80,
    useContentSize: true,
    frame: false,
    transparent: true,
    // enableRemoteModule: false,
    // icon: join(global.__static, isWin ? 'icons/256x256.ico' : 'icons/512x512.png'),
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    roundedCorners: false,
    show: false,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: !isShowTaskbar,
    webPreferences: {
      contextIsolation: false,
      webSecurity: false,
      sandbox: false,
      nodeIntegration: true,
      enableWebSQL: false,
      webgl: false,
      spellcheck: false, // 禁用拼写检查器
    },
  })

  const winURL = import.meta.env.DEV
    ? 'http://localhost:9081'
    : `file://${path.join(encodePath(__dirname), '../renderer-lyric/index.html')}`
  void browserWindow.loadURL(`${winURL}?dark=${shouldUseDarkColors}&theme=${encodeURIComponent(JSON.stringify(theme))}`)

  winEvent()
  // browserWindow.webContents.openDevTools()
}
export const isExistWindow = (): boolean => !!browserWindow

export const closeWindow = () => {
  if (!browserWindow) return
  browserWindow.close()
}

export const showWindow = () => {
  if (!browserWindow) return
  browserWindow.show()
}

export const sendEvent = <T = any>(name: string, params?: T) => {
  if (!browserWindow) return
  mainSend(browserWindow, name, params)
}

export const getBounds = (): Electron.Rectangle => {
  if (!browserWindow) throw new Error('window is not available')
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
    }, 1000)
  },
  clearLoop() {
    if (!this.timeout) return
    clearInterval(this.timeout)
    this.timeout = null
  },
}
