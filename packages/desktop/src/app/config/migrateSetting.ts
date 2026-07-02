// import { compareVer } from './index'

export default (setting: Record<string, unknown>): Partial<AnyListen.AppSetting> => {
  setting = { ...setting }

  if (setting.version === '1.0.2') {
    const keyMap = {
      'desktopLyric.width': 'desktopLyric.multiLine.width',
      'desktopLyric.height': 'desktopLyric.multiLine.height',
      'desktopLyric.x': 'desktopLyric.multiLine.x',
      'desktopLyric.y': 'desktopLyric.multiLine.y',
      'desktopLyric.isDelayScroll': 'desktopLyric.multiLine.isDelayScroll',
      'desktopLyric.scrollAlign': 'desktopLyric.multiLine.scrollAlign',
      'desktopLyric.direction': 'desktopLyric.multiLine.direction',
      'desktopLyric.style.align': 'desktopLyric.multiLine.style.align',
      'desktopLyric.style.font': 'desktopLyric.multiLine.style.font',
      'desktopLyric.style.fontSize': 'desktopLyric.multiLine.style.fontSize',
      'desktopLyric.style.lineGap': 'desktopLyric.multiLine.style.lineGap',
      'desktopLyric.style.lyricUnplayColor': 'desktopLyric.multiLine.style.lyricUnplayColor',
      'desktopLyric.style.lyricPlayedColor': 'desktopLyric.multiLine.style.lyricPlayedColor',
      'desktopLyric.style.lyricShadowColor': 'desktopLyric.multiLine.style.lyricShadowColor',
      'desktopLyric.style.opacity': 'desktopLyric.multiLine.style.opacity',
      'desktopLyric.style.isZoomActiveLrc': 'desktopLyric.multiLine.style.isZoomActiveLrc',
      'desktopLyric.style.isFontWeightFont': 'desktopLyric.multiLine.style.isFontWeightFont',
      'desktopLyric.style.isFontWeightLine': 'desktopLyric.multiLine.style.isFontWeightLine',
      'desktopLyric.style.isFontWeightExtended': 'desktopLyric.multiLine.style.isFontWeightExtended',
    }
    for (const [oldKey, newKey] of Object.entries(keyMap)) {
      if (setting[oldKey] !== undefined) {
        setting[newKey] = setting[oldKey]
      }
    }
  }

  return setting
}
