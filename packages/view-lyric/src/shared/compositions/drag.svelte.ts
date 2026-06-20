import { onMount } from 'svelte'

import { setWinBounds } from '@/shared/ipc/app'

export default (dom: HTMLElement) => {
  const winEvent = {
    isMsDown: false,
    msDownX: 0,
    msDownY: 0,
    windowW: 0,
    windowH: 0,
  }

  const handleLyricDown = (target: EventTarget, x: number, y: number) => {
    winEvent.isMsDown = true
    winEvent.msDownX = x
    winEvent.msDownY = y
    winEvent.windowW = window.innerWidth
    winEvent.windowH = window.innerHeight
    // https://github.com/lyswhut/lx-music-desktop/issues/2244
    // if (import.meta.env.VITE_IS_WINDOWS) setWindowResizeable(false)
  }
  const handleLyricMouseDown = (event: MouseEvent) => {
    // console.log(event.target, event.currentTarget)
    if (event.target !== event.currentTarget) return
    handleLyricDown(event.target!, event.clientX, event.clientY)
  }
  const handleLyricTouchStart = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      const touch = event.changedTouches[0]
      // if (touch.target !== touch.currentTarget) return
      handleLyricDown(event.target!, touch.clientX, touch.clientY)
    }
  }
  const handleMouseMsUp = () => {
    winEvent.isMsDown = false
    // if (import.meta.env.VITE_IS_WINDOWS) setWindowResizeable(true)
  }

  const handleMove = (x: number, y: number) => {
    if (!winEvent.isMsDown) return
    // https://github.com/lyswhut/lx-music-desktop/issues/2244
    if (import.meta.env.VITE_IS_WINDOWS) {
      void setWinBounds({
        x: x - winEvent.msDownX,
        y: y - winEvent.msDownY,
        w: winEvent.windowW,
        h: winEvent.windowH,
      })
    } else {
      void setWinBounds({
        x: x - winEvent.msDownX,
        y: y - winEvent.msDownY,
        w: window.innerWidth,
        h: window.innerHeight,
      })
    }
  }
  const handleMouseMsMove = (event: MouseEvent) => {
    handleMove(event.clientX, event.clientY)
  }
  const handleTouchMove = (e: TouchEvent) => {
    if (e.changedTouches.length) {
      const touch = e.changedTouches[0]
      handleMove(touch.clientX, touch.clientY)
    }
  }

  onMount(() => {
    dom.addEventListener('mousedown', handleLyricMouseDown)
    dom.addEventListener('touchstart', handleLyricTouchStart)
    document.addEventListener('mousemove', handleMouseMsMove)
    document.addEventListener('mouseup', handleMouseMsUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleMouseMsUp)

    return () => {
      dom.removeEventListener('mousedown', handleLyricMouseDown)
      dom.removeEventListener('touchstart', handleLyricTouchStart)
      document.removeEventListener('mousemove', handleMouseMsMove)
      document.removeEventListener('mouseup', handleMouseMsUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseMsUp)
    }
  })
}
