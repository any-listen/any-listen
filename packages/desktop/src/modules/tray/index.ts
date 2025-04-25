import { actions } from '@/actions'
import { appEvent, appState, updateSetting } from '@/app'
import { i18n } from '@/i18n'
import type { WinMainEvent } from '@/renderer/winMain'
import { isWin } from '@any-listen/nodejs/index'
import { Menu, nativeImage, Tray } from 'electron'
import path from 'node:path'

let tray: Electron.Tray | null
let isEnableTray = false
let themeId: number

let isExistMainWindow: null | (() => boolean) = null
let isShowMainWindow: null | (() => boolean) = null

const watchConfigKeys = [
  'desktopLyric.enable',
  'desktopLyric.isLock',
  'desktopLyric.isAlwaysOnTop',
  'tray.themeId',
  'tray.enable',
  'common.langId',
] satisfies Array<keyof AnyListen.AppSetting>

const themeList = [
  {
    id: 0,
    fileName: 'trayTemplate',
    isNative: true,
  },
  {
    id: 1,
    fileName: 'tray_origin',
    isNative: false,
  },
  {
    id: 2,
    fileName: 'tray_black',
    isNative: false,
  },
]

export const createTray = () => {
  if ((tray && !tray.isDestroyed()) || !appState.appSetting['tray.enable']) return

  themeId = appState.appSetting['tray.themeId']
  let theme = themeList.find((item) => item.id === themeId) ?? themeList[0]
  const iconPath = path.join(appState.staticPath, 'images/tray', `${theme.fileName}.png`)

  // 托盘
  tray = new Tray(nativeImage.createFromPath(iconPath))

  tray.setToolTip(i18n.t('app_name'))
  createMenu()
  tray.setIgnoreDoubleClickEvents(true)
  tray.on('click', () => {
    actions.exec('winMain.showWindow')
  })
}

export const destroyTray = () => {
  if (!tray) return
  tray.destroy()
  isEnableTray = false
  tray = null
}

export const createMenu = () => {
  if (!tray) return
  let menu = []
  if (isExistMainWindow?.()) {
    const isShow = isShowMainWindow!()
    menu.push(
      isShow
        ? {
            label: i18n.t('main_window__hide'),
            click() {
              actions.exec('winMain.hideWindow')
            },
          }
        : {
            label: i18n.t('main_window__show'),
            click() {
              actions.exec('winMain.showWindow')
            },
          }
    )
  }
  menu.push(
    appState.appSetting['desktopLyric.enable']
      ? {
          label: i18n.t('desktop_lyric__hide'),
          click() {
            updateSetting({ 'desktopLyric.enable': false })
          },
        }
      : {
          label: i18n.t('desktop_lyric__show'),
          click() {
            updateSetting({ 'desktopLyric.enable': true })
          },
        }
  )
  menu.push(
    appState.appSetting['desktopLyric.isLock']
      ? {
          label: i18n.t('desktop_lyric__unlock'),
          click() {
            updateSetting({ 'desktopLyric.isLock': false })
          },
        }
      : {
          label: i18n.t('desktop_lyric__lock'),
          click() {
            updateSetting({ 'desktopLyric.isLock': true })
          },
        }
  )
  menu.push(
    appState.appSetting['desktopLyric.isAlwaysOnTop']
      ? {
          label: i18n.t('desktop_lyric__top_off'),
          click() {
            updateSetting({ 'desktopLyric.isAlwaysOnTop': false })
          },
        }
      : {
          label: i18n.t('desktop_lyric__top_on'),
          click() {
            updateSetting({ 'desktopLyric.isAlwaysOnTop': true })
          },
        }
  )
  menu.push({
    label: i18n.t('quit'),
    click() {
      actions.exec('app.quit')
    },
  })
  const contextMenu = Menu.buildFromTemplate(menu)
  tray.setContextMenu(contextMenu)
}

export const setTrayImage = (themeId: number) => {
  if (!tray) return
  let theme = themeList.find((item) => item.id === themeId) ?? themeList[0]
  const iconPath = path.join(appState.staticPath, 'images/tray', `${theme.fileName}.png`)
  tray.setImage(nativeImage.createFromPath(iconPath))
}

const init = () => {
  if (themeId != appState.appSetting['tray.themeId']) {
    themeId = appState.appSetting['tray.themeId']
    setTrayImage(themeId)
  }
  if (isEnableTray !== appState.appSetting['tray.enable']) {
    isEnableTray = appState.appSetting['tray.enable']
    appState.appSetting['tray.enable'] ? createTray() : destroyTray()
  }
  createMenu()
}

export const initTray = () => {
  appEvent.on('updated_config', (keys) => {
    if (!watchConfigKeys.some((key) => keys.includes(key))) return
    init()
  })
  appEvent.on('inited', () => {
    init()
  })
}

export const initMainWindowHandler = (
  winMainEvent: WinMainEvent,
  _isExistMainWindow: () => boolean,
  _isShowMainWindow: () => boolean
) => {
  winMainEvent.on('ready_to_show', () => {
    createMenu()
  })
  winMainEvent.on('show', () => {
    createMenu()
  })
  if (!isWin) {
    winMainEvent.on('focus', () => {
      createMenu()
    })
    winMainEvent.on('blur', () => {
      createMenu()
    })
  }
  winMainEvent.on('hide', () => {
    createMenu()
  })
  winMainEvent.on('close', () => {
    destroyTray()
  })
  isExistMainWindow = _isExistMainWindow
  isShowMainWindow = _isShowMainWindow
}
