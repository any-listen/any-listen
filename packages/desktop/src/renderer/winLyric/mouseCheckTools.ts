import { screen } from 'electron'

import { appState } from '@/app'
import { isLinux } from '@/shared/utils'

import { getBounds } from './main'

export const mouseCheckTools = {
  timer: null as NodeJS.Timeout | null,
  isMouseInWindow: false,
  sendMouseLeave: null as (() => void) | null,

  onInBoundsChange(isInBounds: boolean) {
    if (isInBounds) return
    this.stop()
    this.sendMouseLeave?.()
  },

  checkMousePosition() {
    const bounds = getBounds()
    if (!bounds) return
    const point = screen.getCursorScreenPoint()
    const isInBounds =
      point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height
    if (isInBounds !== this.isMouseInWindow) {
      this.isMouseInWindow = isInBounds
      this.onInBoundsChange(isInBounds)
    }
  },

  start() {
    this.timer = setTimeout(() => {
      this.timer = null
      this.checkMousePosition()
      this.start()
    }, 500)
  },

  stop() {
    if (!this.timer) return
    clearTimeout(this.timer)
    this.timer = null
    // console.log('stop check')
  },

  setMouseInWindow(isInWindow: boolean) {
    this.isMouseInWindow = isInWindow
  },
  runCheck(sendMouseLeave: () => void) {
    if (
      isLinux ||
      !appState.appSetting['desktopLyric.isLock'] ||
      !appState.appSetting['desktopLyric.isHoverHide'] ||
      !this.isMouseInWindow
    ) {
      return
    }
    // console.log('run check')
    this.sendMouseLeave = sendMouseLeave
    this.stop()
    this.start()
  },
  cacnelCheck() {
    this.stop()
  },
}
