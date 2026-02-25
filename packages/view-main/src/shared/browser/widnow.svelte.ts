import { windowSizeList } from '@any-listen/common/constants'
import { debounce } from '@any-listen/common/utils'

import { setFullScreen, setRootOffset } from '@/modules/app/store/action'
import { appState } from '@/modules/app/store/state'
import { settingState } from '@/modules/setting/store/state'
import { getItem, LOCAL_STORE_KEYS, setItem } from '@/shared/localStore'

interface WindowInfo {
  offsetX: number
  offsetY: number
  isMaximized: boolean
}
const getWindowInfo = (): WindowInfo => {
  let info = getItem(LOCAL_STORE_KEYS.windowInfo)
  if (info) {
    try {
      const parsed = JSON.parse(info) as WindowInfo
      return parsed
    } catch {}
  }
  return {
    offsetX: 8,
    offsetY: 8,
    isMaximized: false,
  }
}
const saveWindowInfo = (params: WindowInfo) => {
  setItem(LOCAL_STORE_KEYS.windowInfo, JSON.stringify(params))
}
const saveWindowInfoDebounce = debounce(saveWindowInfo, 100)
const resetWindow = () => {
  document.body.style.removeProperty('position')
  document.body.style.removeProperty('width')
  document.body.style.removeProperty('height')
  document.body.style.removeProperty('left')
  document.body.style.removeProperty('top')
}
export const initWindowInfo = () => {
  const info = getWindowInfo()
  if (info.isMaximized) {
    setFullScreen(true)
    setRootOffset(0, 0)
    resetWindow()
    return
  }
  setFullScreen(false)
  setRootOffset(info.offsetX, info.offsetY)
  document.body.style.position = 'absolute'
  document.body.style.width = '1020px'
  document.body.style.height = '670px'
  document.body.style.left = `${info.offsetX}px`
  document.body.style.top = `${info.offsetY}px`
}
export const setMaximized = (maximized: boolean) => {
  if (appState.isFullscreen == maximized) return
  setFullScreen(maximized)
  const info = getWindowInfo()
  info.isMaximized = maximized
  if (maximized) {
    setRootOffset(0, 0)
    resetWindow()
  } else {
    setRootOffset(info.offsetX, info.offsetY)
    const targetSize = windowSizeList.find((w) => w.id == settingState.setting['common.windowSizeId']) || {
      width: 1020,
      height: 670,
    }
    document.body.style.position = 'absolute'
    document.body.style.width = `${targetSize.width}px`
    document.body.style.height = `${targetSize.height}px`
    document.body.style.left = `${info.offsetX}px`
    document.body.style.top = `${info.offsetY}px`
  }
  saveWindowInfo(info)
}

export const handleRelease = () => {
  resetWindow()
}

export const handleConfigChange = (keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) => {
  if (keys.includes('common.windowSizeId')) {
    if (appState.isFullscreen) return
    const targetSize = windowSizeList.find((w) => w.id == setting['common.windowSizeId'])
    if (!targetSize) return
    document.body.style.width = `${targetSize.width}px`
    document.body.style.height = `${targetSize.height}px`
  }
}

const windowMaximize = (dom: HTMLElement) => {
  const handleDblClick = () => {
    setMaximized(!appState.isFullscreen)
  }
  dom.addEventListener('dblclick', handleDblClick)
  return () => {
    dom.removeEventListener('dblclick', handleDblClick)
  }
}

export const windowDarg = (dom: HTMLElement) => {
  const msEvent = {
    isMsDown: false,
    msDownX: 0,
    msDownY: 0,
    winY: 0,
    winX: 0,
    minLeft: 0,
    minTop: 0,
  }
  const handleMove = (clientX: number, clientY: number) => {
    if (!msEvent.isMsDown) return
    const x = Math.max(msEvent.winX + clientX - msEvent.msDownX, msEvent.minLeft)
    const y = Math.max(msEvent.winY + clientY - msEvent.msDownY, msEvent.minTop)
    setRootOffset(x, y)
    document.body.style.left = `${x}px`
    document.body.style.top = `${y}px`
    saveWindowInfoDebounce({
      offsetX: x,
      offsetY: y,
      isMaximized: appState.isFullscreen,
    })
  }

  const handleDown = (clientX: number, clientY: number) => {
    if (appState.isFullscreen) return
    handleMouseUp()
    msEvent.msDownX = clientX
    msEvent.msDownY = clientY
    msEvent.isMsDown = true
    msEvent.winX = parseInt(document.body.style.left)
    msEvent.winY = parseInt(document.body.style.top)
    msEvent.minLeft = -parseInt(document.body.style.width) + 80
    // msEvent.minTop = parseInt(document.body.style.height)
  }

  const handleMouseDown = (event: MouseEvent) => {
    handleDown(event.clientX, event.clientY)
  }
  const handleTouchDown = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      const touch = event.changedTouches[0]
      handleDown(touch.clientX, touch.clientY)
    }
  }
  const handleMouseMove = (event: MouseEvent) => {
    handleMove(event.clientX, event.clientY)
  }
  const handleTouchMove = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      const touch = event.changedTouches[0]
      handleMove(touch.clientX, touch.clientY)
    }
  }
  const handleMouseUp = () => {
    msEvent.isMsDown = false
  }

  dom.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  dom.addEventListener('touchstart', handleTouchDown)
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleMouseUp)
  const removeMaximize = windowMaximize(dom)
  return () => {
    dom.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    dom.removeEventListener('touchstart', handleTouchDown)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleMouseUp)
    removeMaximize()
  }
}
