import { appState } from '@/app'

// 设置窗口位置、大小
export let minWidth = 38
export let minHeight = 38

// const updateBounds = (bounds: Bounds) => {
//   bounds.x = bounds.x
//   return bounds
// }

/**
 *
 * @param bounds 当前设置
 * @param param 新设置（相对于当前设置）
 * @returns
 */
export const getLyricWindowBounds = (
  bounds: Electron.Rectangle,
  { x, y, w, h }: AnyListen.DesktopLyric.NewBounds
): Electron.Rectangle => {
  if (w < minWidth) w = minWidth
  if (h < minHeight) h = minHeight

  if (appState.appSetting['desktopLyric.isLockScreen']) {
    if (!appState.envParams.workAreaSize) return bounds
    const maxWinW = appState.envParams.workAreaSize.width
    const maxWinH = appState.envParams.workAreaSize.height

    if (w > maxWinW) w = maxWinW
    if (h > maxWinH) h = maxWinH

    const maxX = appState.envParams.workAreaSize.width - w
    const maxY = appState.envParams.workAreaSize.height - h

    x += bounds.x
    y += bounds.y

    if (x > maxX) x = maxX
    else if (x < 0) x = 0

    if (y > maxY) y = maxY
    else if (y < 0) y = 0
  } else {
    y += bounds.y
    x += bounds.x
  }

  // console.log('util bounds', bounds)
  return { width: w, height: h, x, y }
}

const initMultiLineWindowSize = () => {
  let x = appState.appSetting['desktopLyric.multiLine.x']
  let y = appState.appSetting['desktopLyric.multiLine.y']
  let width = appState.appSetting['desktopLyric.multiLine.width']
  let height = appState.appSetting['desktopLyric.multiLine.height']

  if (x == null || y == null) {
    if (width < minWidth) width = minWidth
    if (height < minHeight) height = minHeight
    if (appState.envParams.workAreaSize) {
      x = appState.envParams.workAreaSize.width - width
      y = appState.envParams.workAreaSize.height - height
    } else {
      x = 0
      y = 0
    }
  } else {
    let bounds = getLyricWindowBounds({ x, y, width, height }, { x: 0, y: 0, w: width, h: height })
    x = bounds.x
    y = bounds.y
    width = bounds.width
    height = bounds.height
  }
  return {
    x,
    y,
    width,
    height,
  }
}
const getFontSizeLevel = (fontSize: number) => {
  if (fontSize <= 30) return 1
  if (fontSize <= 50) return 1.2
  if (fontSize <= 66) return 1.6
  return 2
}
export const getClassicWindowSize = () => {
  let fontSize = appState.appSetting['desktopLyric.classic.style.fontSize']
  const lines = appState.appSetting['desktopLyric.classic.showExtendedLyrics'] ? 6 : 4
  let height = Math.ceil(fontSize * lines * 1.2 + fontSize / 2 + fontSize * 0.16 * 4)
  let width = fontSize * 30 * getFontSizeLevel(fontSize)
  let x = appState.appSetting['desktopLyric.classic.x']
  let y = appState.appSetting['desktopLyric.classic.y']

  if (x == null || y == null) {
    if (width < minWidth) width = minWidth
    if (height < minHeight) height = minHeight
    if (appState.envParams.workAreaSize) {
      if (width > appState.envParams.workAreaSize.width) width = appState.envParams.workAreaSize.width
      if (height > appState.envParams.workAreaSize.height) height = appState.envParams.workAreaSize.height
      x = (appState.envParams.workAreaSize.width - width) / 2
      y = appState.envParams.workAreaSize.height - height
    } else {
      x = 0
      y = 0
    }
  } else {
    let bounds = getLyricWindowBounds({ x, y, width, height }, { x: 0, y: 0, w: width, h: height })
    x = bounds.x
    y = bounds.y
    width = bounds.width
    height = bounds.height
  }

  return {
    x,
    y,
    width,
    height,
  }
}

export const initWindowSize = () => {
  return appState.appSetting['desktopLyric.mode'] === 'classic' ? getClassicWindowSize() : initMultiLineWindowSize()
}
