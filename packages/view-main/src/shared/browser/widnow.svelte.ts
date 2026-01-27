import { setRootOffset } from '@/modules/app/store/action'
import { appState } from '@/modules/app/store/state'
import { windowSizeList } from '@any-listen/common/constants'

export const handleConfigChange = (keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) => {
  if (import.meta.env.VITE_IS_WEB && document.documentElement.classList.contains('fullscreen')) return
  if (keys.includes('common.windowSizeId')) {
    if (appState.isFullscreen) return
    const targetSize = windowSizeList.find((w) => w.id == setting['common.windowSizeId'])
    if (!targetSize) return
    document.body.style.width = `${targetSize.width}px`
    document.body.style.height = `${targetSize.height}px`
  }
}

export const windowDarg = (dom: HTMLElement) => {
  if (import.meta.env.VITE_IS_WEB && document.documentElement.classList.contains('fullscreen')) return () => {}
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
  }

  const handleDown = (clientX: number, clientY: number) => {
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
  if (!document.body.style.position) {
    document.body.style.position = 'absolute'
    document.body.style.left = `${appState.rootOffsetX}px`
    document.body.style.top = `${appState.rootOffsetY}px`
    document.body.style.width = '1020px'
    document.body.style.height = '670px'
  }
  return () => {
    dom.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    dom.removeEventListener('touchstart', handleTouchDown)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleMouseUp)
  }
}
