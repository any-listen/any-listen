import { onMount, tick } from 'svelte'

import { lyricEvent } from '@/modules/lyric/store/event'
import { lyricState, type Line } from '@/modules/lyric/store/state'
import { playerState } from '@/modules/player/store/state'
import { settingState } from '@/modules/setting/store/state'
import { setWinBounds } from '@/shared/ipc/app'

const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

type Noop = () => void
const noop: Noop = () => {}

type ScrollXElement<T> = {
  __scrollXLockKey?: number
  __scrollXNextParams?: [ScrollXElement<HTMLElement>, number, number, Noop, Noop]
  __scrollXTimeout?: number
  __scrollXDelayTimeout?: number
  scrollLeft?: number
  scrollTo?: HTMLElement['scrollTo']
} & Omit<T, 'scrollLeft' | 'scrollTo'>

const handleScrollXBase = (
  element: ScrollXElement<HTMLElement> | null,
  to: number,
  duration = 300,
  onEnd = noop,
  onCancel = noop
): Noop => {
  if (!element) {
    onCancel()
    return noop
  }

  const clean = () => {
    element.__scrollXLockKey = undefined
    element.__scrollXNextParams = undefined
    if (element.__scrollXTimeout) window.clearTimeout(element.__scrollXTimeout)
    element.__scrollXTimeout = undefined
  }

  if (element.__scrollXLockKey) {
    element.__scrollXNextParams?.[4]()
    element.__scrollXNextParams = [element, to, duration, onEnd, onCancel]
    element.__scrollXLockKey = -1
    return clean
  }

  const start = element.scrollLeft ?? 0
  const maxScrollLeft = Math.max(element.scrollWidth - element.clientWidth, 0)
  // vertical-rl containers may use negative scrollLeft ranges in Chromium.
  const useNegativeRange = start < 0 || to < 0
  const minAllowed = useNegativeRange ? -maxScrollLeft : 0
  const maxAllowed = useNegativeRange ? 0 : maxScrollLeft
  if (to > maxAllowed) to = maxAllowed
  else if (to < minAllowed) to = minAllowed
  if (to === start) {
    onEnd()
    return noop
  }

  const change = to - start
  const increment = 10
  if (!change) {
    onEnd()
    return noop
  }

  let currentTime = 0
  let key = Math.random()

  const animateScroll = () => {
    element.__scrollXTimeout = undefined
    if (element.__scrollXNextParams && currentTime > duration * 0.75) {
      const [_element, _to, _duration, _onEnd, _onCancel] = element.__scrollXNextParams
      clean()
      onCancel()
      handleScrollXBase(_element, _to, _duration, _onEnd, _onCancel)
      return
    }

    currentTime += increment
    const val = Math.trunc(easeInOutQuad(currentTime, start, change, duration))
    if (element.scrollTo) {
      element.scrollTo(val, 0)
    } else {
      element.scrollLeft = val
    }

    if (currentTime < duration) {
      element.__scrollXTimeout = window.setTimeout(animateScroll, increment)
    } else if (element.__scrollXNextParams) {
      const [_element, _to, _duration, _onEnd, _onCancel] = element.__scrollXNextParams
      clean()
      handleScrollXBase(_element, _to, _duration, _onEnd, _onCancel)
    } else {
      clean()
      onEnd()
    }
  }

  element.__scrollXLockKey = key
  animateScroll()

  return clean
}

const handleScrollX = (
  element: ScrollXElement<HTMLElement>,
  to: number,
  duration = 300,
  onEnd: Noop = noop,
  onCancel: Noop = noop,
  delay = 0
): Noop => {
  let cancelFn: Noop
  if (element.__scrollXDelayTimeout != null) {
    window.clearTimeout(element.__scrollXDelayTimeout)
    element.__scrollXDelayTimeout = undefined
  }
  if (delay) {
    let scrollCancelFn: Noop | null = null
    cancelFn = () => {
      if (element.__scrollXDelayTimeout == null) {
        scrollCancelFn?.()
      } else {
        window.clearTimeout(element.__scrollXDelayTimeout)
        element.__scrollXDelayTimeout = undefined
        onCancel()
      }
    }
    element.__scrollXDelayTimeout = window.setTimeout(() => {
      element.__scrollXDelayTimeout = undefined
      scrollCancelFn = handleScrollXBase(element, to, duration, onEnd, onCancel)
    }, delay)
  } else {
    cancelFn = handleScrollXBase(element, to, duration, onEnd, onCancel)
  }
  return cancelFn
}

const getOffsetLeft = (contentWidth: number, lineWidth: number, padding: number) => {
  switch (settingState.setting['desktopLyric.multiLine.scrollAlign']) {
    case 'top':
      return contentWidth - lineWidth - -(padding / 2)
    default:
      return contentWidth * 0.5 - lineWidth / 2
  }
}

export default (onMsDown: (isDown: boolean) => void) => {
  return (domLyricText: HTMLElement) => {
    const domLyric = domLyricText.parentNode as HTMLElement

    let isStopScroll = false
    const winEvent = {
      isMsDown: false,
      msDownX: 0,
      msDownY: 0,
      windowW: 0,
      windowH: 0,
    }

    let msDown = false
    let msDownX = 0
    let msDownScrollX = 0
    let timeout: number | null = null
    let cancelScrollFn: (() => void) | null = null
    let domLines: NodeListOf<HTMLElement>
    let lineWidths: number[]
    let isSetedLines = false

    const handleMsDown = (isDown: boolean) => {
      msDown = isDown
      onMsDown(isDown)
    }

    const handleScrollLrc = (duration = 300) => {
      if (!domLines?.length || !domLyric) return
      if (isStopScroll) return
      const line = Math.max(lyricState.line, 0)
      let domP = domLines[line] as HTMLElement | null
      let width = lineWidths[line] ?? 0

      if (domP) {
        let offsetLeft = domP.offsetLeft
        let lineWidth = width
        let padding: number
        if (lyricState.line < 0) {
          padding = Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize']) * 2
        } else if (settingState.setting['desktopLyric.multiLine.style.isZoomActiveLrc']) {
          padding = Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize']) * 1.1 * 2
          lineWidth += padding
          lineWidth *= 1.14
        } else {
          padding = Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize']) * 2
          lineWidth += padding
        }
        const offset = getOffsetLeft(domLyric.clientWidth, lineWidth, padding)
        const scrollTarget = domP ? offsetLeft - offset : 0
        cancelScrollFn = handleScrollX(domLyric, scrollTarget, duration)
      } else {
        cancelScrollFn = handleScrollX(domLyric, 0, duration)
      }
    }

    const clearLyricScrollTimeout = () => {
      if (!timeout) return
      clearTimeout(timeout)
      timeout = null
    }
    const startLyricScrollTimeout = () => {
      clearLyricScrollTimeout()
      timeout = setTimeout(() => {
        timeout = null
        isStopScroll = false
        if (!playerState.playing) return
        handleScrollLrc()
      }, 3000)
    }

    let delayScrollTimeout: number | null = null
    const clearDelayScrollTimeout = () => {
      if (!delayScrollTimeout) return
      clearTimeout(delayScrollTimeout)
      delayScrollTimeout = null
    }

    const handleLyricDown = (target: HTMLElement, x: number, y: number) => {
      if (
        target.classList.contains('font-lrc') ||
        (target.parentNode as HTMLElement).classList.contains('font-lrc') ||
        target.classList.contains('extended') ||
        (target.parentNode as HTMLElement).classList.contains('extended')
      ) {
        if (delayScrollTimeout) {
          clearTimeout(delayScrollTimeout)
          delayScrollTimeout = null
        }
        handleMsDown(true)
        msDownX = x
        msDownScrollX = domLyric.scrollLeft
      } else {
        winEvent.isMsDown = true
        winEvent.msDownX = x
        winEvent.msDownY = y
        winEvent.windowW = window.innerWidth
        winEvent.windowH = window.innerHeight
        // https://github.com/lyswhut/lx-music-desktop/issues/2244
        // if (import.meta.env.VITE_IS_WINDOWS) setWindowResizeable(false)
      }
    }
    const handleLyricMouseDown = (event: MouseEvent) => {
      handleLyricDown(event.target as HTMLElement, event.clientX, event.clientY)
    }
    const handleLyricTouchStart = (event: TouchEvent) => {
      if (event.changedTouches.length) {
        const touch = event.changedTouches[0]
        handleLyricDown(event.target as HTMLElement, touch.clientX, touch.clientY)
      }
    }
    const handleMouseMsUp = () => {
      handleMsDown(false)
      winEvent.isMsDown = false
      // if (import.meta.env.VITE_IS_WINDOWS) setWindowResizeable(true)
    }

    const handleMove = (x: number, y: number) => {
      if (msDown) {
        isStopScroll ||= true
        if (cancelScrollFn) {
          cancelScrollFn()
          cancelScrollFn = null
        }
        domLyric.scrollLeft = msDownScrollX + msDownX - x
        startLyricScrollTimeout()
      } else if (winEvent.isMsDown) {
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

    const handleWheel = (event: WheelEvent) => {
      if (cancelScrollFn) {
        cancelScrollFn()
        cancelScrollFn = null
      }
      domLyric.scrollLeft -= event.deltaY
      startLyricScrollTimeout()
    }

    const setLyric = (lines: Line[]) => {
      const domLineContent = document.createDocumentFragment()
      for (const line of lines) {
        domLineContent.appendChild(line.dom_line)
      }
      domLyricText.textContent = ''
      domLyricText.appendChild(domLineContent)
      void tick().then(() => {
        domLines = domLyric.querySelectorAll('.line-content')
        lineWidths = Array.from(domLines).map((l) => l.clientWidth)
        handleScrollLrc()
      })
    }

    let oldLines = 0
    const initLrc = (lines: Line[]) => {
      isSetedLines = true
      clearDelayScrollTimeout()
      if (oldLines) {
        if (lines.length) {
          setLyric(lines)
        } else {
          cancelScrollFn = handleScrollX(
            domLyric,
            0,
            300,
            () => {
              if (lyricState.lines !== lines) return
              setLyric(lines)
            },
            () => {
              if (lyricState.lines !== lines) return
              setLyric(lines)
            },
            50
          )
        }
      } else {
        setLyric(lines)
      }
      oldLines = lines.length
    }

    let oldLine = -1
    const scrollLine = (line: number) => {
      if (line < 0) {
        oldLine = line
        return
      }
      if (line === 0 && isSetedLines) {
        isSetedLines = false
        oldLine = line
        return
      }
      isSetedLines &&= false
      if (line - oldLine != 1) {
        oldLine = line
        handleScrollLrc()
        return
      }

      if (settingState.setting['desktopLyric.multiLine.isDelayScroll']) {
        delayScrollTimeout ??= setTimeout(() => {
          delayScrollTimeout = null
          handleScrollLrc(600)
        }, 600)
      } else {
        handleScrollLrc(600)
      }
      oldLine = line
    }

    onMount(() => {
      const unsub1 = lyricEvent.on('linesChanged', initLrc)
      let preLine = -1
      const unsub2 = lyricEvent.on('lineChanged', (text, line) => {
        if (preLine == line) return
        preLine = line
        scrollLine(line)
      })

      document.addEventListener('mousemove', handleMouseMsMove)
      document.addEventListener('mouseup', handleMouseMsUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseMsUp)
      domLyric.addEventListener('wheel', handleWheel, { passive: false })
      domLyric.addEventListener('mousedown', handleLyricMouseDown, { passive: false })
      domLyric.addEventListener('touchstart', handleLyricTouchStart, { passive: false })

      initLrc(lyricState.lines)

      return () => {
        unsub1()
        unsub2()
        domLyric.removeEventListener('wheel', handleWheel)
        domLyric.removeEventListener('mousedown', handleLyricMouseDown)
        domLyric.removeEventListener('touchstart', handleLyricTouchStart)
        document.removeEventListener('mousemove', handleMouseMsMove)
        document.removeEventListener('mouseup', handleMouseMsUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleMouseMsUp)
        clearLyricScrollTimeout()
        clearDelayScrollTimeout()
      }
    })
  }
}
