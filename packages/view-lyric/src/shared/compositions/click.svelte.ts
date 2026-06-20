export const domClick = (onclick: () => void) => {
  let msDown: null | { x: number; y: number } = null

  const handleDown = (x: number, y: number) => {
    msDown = { x, y }
  }
  const handleUp = (x: number, y: number) => {
    if (!msDown) return
    if (Math.abs(x - msDown.x) < 5 && Math.abs(y - msDown.y) < 5) {
      onclick()
    }
    msDown = null
  }
  const handleMouseDown = (evt: MouseEvent) => {
    if (evt.target !== evt.currentTarget) return
    handleDown(evt.clientX, evt.clientY)
  }
  const handleMouseUp = (evt: MouseEvent) => {
    if (evt.target !== evt.currentTarget) return
    handleUp(evt.clientX, evt.clientY)
  }
  const handleTouchStart = (evt: TouchEvent) => {
    if (evt.target !== evt.currentTarget) return
    if (evt.touches.length === 1) {
      const touch = evt.touches[0]
      handleDown(touch.clientX, touch.clientY)
    }
  }
  const handleTouchEnd = (evt: TouchEvent) => {
    if (evt.target !== evt.currentTarget) return
    if (evt.changedTouches.length === 1) {
      const touch = evt.changedTouches[0]
      handleUp(touch.clientX, touch.clientY)
    }
  }

  return (dom: HTMLElement) => {
    dom.addEventListener('mousedown', handleMouseDown)
    dom.addEventListener('mouseup', handleMouseUp)
    dom.addEventListener('touchstart', handleTouchStart)
    dom.addEventListener('touchend', handleTouchEnd)

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown)
      dom.removeEventListener('mouseup', handleMouseUp)
      dom.removeEventListener('touchstart', handleTouchStart)
      dom.removeEventListener('touchend', handleTouchEnd)
    }
  }
}
