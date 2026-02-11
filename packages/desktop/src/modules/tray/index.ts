import { actions } from '@/actions'
import { appEvent, appState, updateSetting } from '@/app'
import { i18n } from '@/i18n'
import type { WinMainEvent } from '@/renderer/winMain'
import { isMac, isWin } from '@any-listen/nodejs/index'
import { Menu, nativeImage, Tray } from 'electron'
import path from 'node:path'
import { playerEvent } from '../player'

let tray: Electron.Tray | null
let isEnableTray = false
let isShowStatusBarLyric = false
let themeId: number

const playerState = {
  empty: true,
  collect: false,
  play: false,
  lyricLineText: '',
}

let isExistMainWindow: null | (() => boolean) = null
let isShowMainWindow: null | (() => boolean) = null

const watchConfigKeys = [
  // 'desktopLyric.enable',
  // 'desktopLyric.isLock',
  // 'desktopLyric.isAlwaysOnTop',
  'player.isShowStatusBarLyric',
  'tray.themeId',
  'tray.enable',
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

const getTrayImage = (themeId: number) => {
  let theme = themeList.find((item) => item.id === themeId) ?? themeList[0]
  const iconPath = path.join(appState.staticPath, 'images/tray', theme.fileName + (isWin ? '.ico' : '.png'))
  return nativeImage.createFromPath(iconPath)
}

export const createTray = () => {
  if ((tray && !tray.isDestroyed()) || !appState.appSetting['tray.enable']) return

  themeId = appState.appSetting['tray.themeId']

  // 托盘
  tray = new Tray(getTrayImage(themeId))

  // tray.setToolTip(i18n.t('app_name'))
  // createMenu()
  tray.setIgnoreDoubleClickEvents(true)
  if (isWin) {
    tray.on('click', () => {
      actions.exec('winMain.showWindow')
    })
  }
}

export const destroyTray = () => {
  if (!tray) return
  tray.destroy()
  isEnableTray = false
  isShowStatusBarLyric = false
  tray = null
}

const createPlayerMenu = () => {
  let menu: Electron.MenuItemConstructorOptions[] = []
  menu.push(
    playerState.play
      ? {
          label: i18n.t('player__pause'),
          click() {
            void actions.exec('winMain.pause')
          },
        }
      : {
          label: i18n.t('player__play'),
          click() {
            void actions.exec('winMain.play')
          },
        }
  )
  menu.push({
    label: i18n.t('player__prev'),
    click() {
      void actions.exec('winMain.prev')
    },
  })
  menu.push({
    label: i18n.t('player__next'),
    click() {
      void actions.exec('winMain.next')
    },
  })
  menu.push(
    playerState.collect
      ? {
          label: i18n.t('player__uncollect'),
          click() {
            void actions.exec('player.uncollectMusic')
          },
        }
      : {
          label: i18n.t('player__collect'),
          click() {
            void actions.exec('player.collectMusic')
          },
        }
  )
  return menu
}

export const createMenu = () => {
  if (!tray) return
  let menu: Electron.MenuItemConstructorOptions[] = createPlayerMenu()
  if (playerState.empty) for (const m of menu) m.enabled = false

  // menu.push({ type: 'separator' })
  // menu.push(
  //   appState.appSetting['desktopLyric.enable']
  //     ? {
  //         label: i18n.t('desktop_lyric__hide'),
  //         click() {
  //           updateSetting({ 'desktopLyric.enable': false })
  //         },
  //       }
  //     : {
  //         label: i18n.t('desktop_lyric__show'),
  //         click() {
  //           updateSetting({ 'desktopLyric.enable': true })
  //         },
  //       }
  // )
  // menu.push(
  //   appState.appSetting['desktopLyric.isLock']
  //     ? {
  //         label: i18n.t('desktop_lyric__unlock'),
  //         click() {
  //           updateSetting({ 'desktopLyric.isLock': false })
  //         },
  //       }
  //     : {
  //         label: i18n.t('desktop_lyric__lock'),
  //         click() {
  //           updateSetting({ 'desktopLyric.isLock': true })
  //         },
  //       }
  // )
  // menu.push(
  //   appState.appSetting['desktopLyric.isAlwaysOnTop']
  //     ? {
  //         label: i18n.t('desktop_lyric__top_off'),
  //         click() {
  //           updateSetting({ 'desktopLyric.isAlwaysOnTop': false })
  //         },
  //       }
  //     : {
  //         label: i18n.t('desktop_lyric__top_on'),
  //         click() {
  //           updateSetting({ 'desktopLyric.isAlwaysOnTop': true })
  //         },
  //       }
  // )
  if (isMac) {
    menu.push({ type: 'separator' })
    menu.push(
      isShowStatusBarLyric
        ? {
            label: i18n.t('tray.hide_statusbar_lyric'),
            click() {
              updateSetting({ 'player.isShowStatusBarLyric': false })
            },
          }
        : {
            label: i18n.t('tray.show_statusbar_lyric'),
            click() {
              updateSetting({ 'player.isShowStatusBarLyric': true })
            },
          }
    )
  }

  menu.push({ type: 'separator' })
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
  menu.push({
    label: i18n.t('quit'),
    click() {
      actions.exec('app.quit')
    },
  })
  const contextMenu = Menu.buildFromTemplate(menu)
  tray.setContextMenu(contextMenu)
}

const titleInfo = {
  title: '',
}
const resetLyric = () => {
  titleInfo.title = ''
  tray?.setTitle('')
}
const setLyric = (lyricLineText = playerState.lyricLineText) => {
  if (lyricLineText !== playerState.lyricLineText) {
    playerState.lyricLineText = lyricLineText
  }
  if (isShowStatusBarLyric && tray) {
    let title = playerState.play ? lyricLineText : ''
    if (titleInfo.title === title) return
    titleInfo.title = title
    if (title.length > 30) title = `${title.substring(0, 30)}...`
    tray.setTitle(title)
  }
}

const tipInfo = {
  defaultTip: '',
  name: '',
  singer: '',
}
const setTip = () => {
  if (!tray) return

  let tip: string
  if (tipInfo.name) {
    if (tipInfo.name.length > 20) tipInfo.name = `${tipInfo.name.substring(0, 20)}...`
    if (tipInfo.singer && tipInfo.singer.length > 20) tipInfo.singer = `${tipInfo.singer.substring(0, 20)}...`

    tip = `${tipInfo.defaultTip}\n${i18n.t('tray.music_name')}${tipInfo.name}${tipInfo.singer ? `\n${i18n.t('tray.music_singer')}${tipInfo.singer}` : ''}`
  } else tip = tipInfo.defaultTip
  tray.setToolTip(tip)
}

const init = () => {
  if (themeId != appState.appSetting['tray.themeId']) {
    themeId = appState.appSetting['tray.themeId']
    tray?.setImage(getTrayImage(themeId))
  }
  if (isEnableTray !== appState.appSetting['tray.enable']) {
    isEnableTray = appState.appSetting['tray.enable']
    appState.appSetting['tray.enable'] ? createTray() : destroyTray()
  }
  if (isShowStatusBarLyric !== appState.appSetting['player.isShowStatusBarLyric']) {
    isShowStatusBarLyric = appState.appSetting['player.isShowStatusBarLyric']
    if (isShowStatusBarLyric) {
      setLyric(playerState.lyricLineText)
    } else {
      resetLyric()
    }
  }

  setTip()
  createMenu()
}

export const initTray = async () => {
  tipInfo.defaultTip = i18n.t('app_name')
  appEvent.on('updated_config', (keys) => {
    if (!watchConfigKeys.some((key) => keys.includes(key))) return
    init()
  })
  appEvent.on('inited', () => {
    init()
  })
  appEvent.on('locale_change', () => {
    tipInfo.defaultTip = i18n.t('app_name')
    init()
  })
  playerEvent.on('musicInfoUpdated', (info) => {
    if (info.id !== undefined) {
      const empty = info.id == null
      if (playerState.empty !== empty) {
        playerState.empty = empty
        if (empty) {
          playerState.collect = false
          playerState.play = false
        }
        createMenu()
      }
    }
    let updateTip = false
    if (info.name != null) {
      updateTip ||= true
      tipInfo.name = info.name
      tipInfo.singer = ''
    }
    if (info.singer != null) {
      updateTip ||= true
      tipInfo.singer = info.singer
    }
    if (updateTip) setTip()
  })
  playerEvent.on('status', ([_, isPlaying]) => {
    if (playerState.play == isPlaying) return
    playerState.play = isPlaying
    setLyric()
    createMenu()
  })
  playerEvent.on('collectStatus', (collect) => {
    playerState.collect = collect
    createMenu()
  })
  playerEvent.on('lyricText', (text) => {
    setLyric(text)
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
