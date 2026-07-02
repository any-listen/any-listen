import { onMount, tick } from 'svelte'

import { handleScroll } from '@/components/base/utils'
import { lyricEvent } from '@/modules/lyric/store/event'
import { lyricState, type Line } from '@/modules/lyric/store/state'
import { playerState } from '@/modules/player/store/state'
import { settingState } from '@/modules/setting/store/state'
import { setWinBounds } from '@/shared/ipc/app'

const getOffsetTop = (contentHeight: number, lineHeight: number, padding: number) => {
  switch (settingState.setting['desktopLyric.multiLine.scrollAlign']) {
    case 'top':
      return -(padding / 2)
    default:
      return contentHeight * 0.5 - lineHeight / 2
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
    let msDownY = 0
    let msDownScrollY = 0
    let timeout: number | null = null
    let cancelScrollFn: (() => void) | null = null
    let domLines: NodeListOf<HTMLElement>
    let lineHeights: number[]
    let isSetedLines = false
    let prevActiveLine = -1

    const handleMsDown = (isDown: boolean) => {
      msDown = isDown
      onMsDown(isDown)
    }
    const handleScrollLrc = (duration = 300) => {
      if (!domLines?.length || !domLyric) return
      if (isStopScroll) return
      const line = Math.max(lyricState.line, 0)
      let domP = domLines[line] as HTMLElement | null
      let height = lineHeights[line] ?? 0

      if (domP) {
        let offsetTop = domP.offsetTop
        let lineHeight = height
        let padding: number
        if (lyricState.line < 0) {
          padding = Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize']) * 2
        } else if (
          !settingState.setting['desktopLyric.multiLine.isDelayScroll'] &&
          settingState.setting['desktopLyric.multiLine.style.isZoomActiveLrc']
        ) {
          padding = Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize']) * 1.1 * 2
          lineHeight += padding
          lineHeight *= 1.14
          if (prevActiveLine < line) {
            const preDomP = domLines[prevActiveLine] as HTMLElement | null
            const preHeight = lineHeights[prevActiveLine] ?? 0
            if (preDomP && preDomP !== domP) offsetTop -= preDomP.clientHeight - preHeight
          }
        } else {
          padding = Math.trunc(settingState.setting['desktopLyric.multiLine.style.fontSize']) * 2
        }
        cancelScrollFn = handleScroll(
          domLyric,
          domP ? offsetTop - getOffsetTop(domLyric.clientHeight, lineHeight, padding) : 0,
          duration
        )
      } else {
        cancelScrollFn = handleScroll(domLyric, 0, duration)
      }
      prevActiveLine = lyricState.line
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
        msDownY = y
        msDownScrollY = domLyric.scrollTop
      } else {
        winEvent.isMsDown = true
        winEvent.msDownX = x
        winEvent.msDownY = y
        winEvent.windowW = window.innerWidth
        winEvent.windowH = window.innerHeight
        // https://github.com/lyswhut/lx-music-desktop/issues/2244
        // if (isWin) setWindowResizeable(false)
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
      // if (isWin) setWindowResizeable(true)
    }

    const handleMove = (x: number, y: number) => {
      if (msDown) {
        isStopScroll ||= true
        if (cancelScrollFn) {
          cancelScrollFn()
          cancelScrollFn = null
        }
        domLyric.scrollTop = msDownScrollY + msDownY - y
        startLyricScrollTimeout()
      } else if (winEvent.isMsDown) {
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
      console.log(event.deltaY)
      if (cancelScrollFn) {
        cancelScrollFn()
        cancelScrollFn = null
      }
      domLyric.scrollTop += event.deltaY
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
        lineHeights = Array.from(domLines).map((l) => l.clientHeight)
        handleScrollLrc()
      })
    }

    let oldLines = 0
    const initLrc = (lines: Line[]) => {
      if (isStopScroll) {
        isStopScroll = false
        // options.onSetStopScroll(false)
        clearLyricScrollTimeout()
      }
      clearDelayScrollTimeout()
      isSetedLines = true
      if (oldLines) {
        if (lines.length) {
          setLyric(lines)
        } else {
          cancelScrollFn = handleScroll(
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

    let delayScrollTimeout: number | null = null
    let oldLine = -1
    const clearDelayScrollTimeout = () => {
      if (!delayScrollTimeout) return
      clearTimeout(delayScrollTimeout)
      delayScrollTimeout = null
    }
    const scrollLine = (line: number) => {
      // 切歌或者第一句未开始
      if (line < 0) {
        oldLine = line
        // 如果是切换歌词，那么跳过滚动
        if (isSetedLines) isSetedLines = false
        else handleScrollLrc()
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
        }, 650)
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
