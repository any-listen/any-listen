import { appState } from '@/app'

// 设置窗口位置、大小
export let minWidth = 80
export let minHeight = 50

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
  { x = 0, y = 0, w = 0, h = 0 }: AnyListen.DesktopLyric.NewBounds
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

export const watchConfigKeys = [
  'desktopLyric.enable',
  'desktopLyric.isLock',
  'desktopLyric.isAlwaysOnTop',
  'desktopLyric.isAlwaysOnTopLoop',
  'desktopLyric.isShowTaskbar',
  'desktopLyric.audioVisualization',
  'desktopLyric.width',
  'desktopLyric.height',
  'desktopLyric.x',
  'desktopLyric.y',
  'desktopLyric.isLockScreen',
  'desktopLyric.isDelayScroll',
  'desktopLyric.scrollAlign',
  'desktopLyric.isHoverHide',
  'desktopLyric.direction',
  'desktopLyric.style.align',
  'desktopLyric.style.lyricUnplayColor',
  'desktopLyric.style.lyricPlayedColor',
  'desktopLyric.style.lyricShadowColor',
  'desktopLyric.style.font',
  'desktopLyric.style.fontSize',
  'desktopLyric.style.lineGap',
  // 'desktopLyric.style.fontWeight',
  'desktopLyric.style.opacity',
  'desktopLyric.style.ellipsis',
  'desktopLyric.style.isFontWeightFont',
  'desktopLyric.style.isFontWeightLine',
  'desktopLyric.style.isFontWeightExtended',
  'desktopLyric.style.isZoomActiveLrc',
  'common.langId',
  'player.isShowLyricTranslation',
  'player.isShowLyricRoma',
  'player.isPlayAwlrc',
  'player.playbackRate',
] satisfies Array<keyof AnyListen.AppSetting>

export const buildLyricConfig = (
  appSetting: Partial<AnyListen.AppSetting>
): [Array<keyof Partial<AnyListen.DesktopLyric.Config>>, Partial<AnyListen.DesktopLyric.Config>] => {
  const setting: Partial<AnyListen.DesktopLyric.Config> = {}
  const keys: Array<keyof AnyListen.DesktopLyric.Config> = []
  for (const key of watchConfigKeys) {
    if (key in appSetting) {
      keys.push(key)
      setting[key] = appSetting[key]
    }
  }
  return [keys, setting]
}

export const initWindowSize = (
  x: AnyListen.AppSetting['desktopLyric.x'],
  y: AnyListen.AppSetting['desktopLyric.y'],
  width: AnyListen.AppSetting['desktopLyric.width'],
  height: AnyListen.AppSetting['desktopLyric.height']
) => {
  if (x == null || y == null) {
    if (width < minWidth) width = minWidth
    if (height < minHeight) height = minHeight
    if (appState.envParams.workAreaSize) {
      x = appState.envParams.workAreaSize.width - width
      y = appState.envParams.workAreaSize.height - height
    } else {
      x = y = 0
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
