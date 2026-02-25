import { onMount, tick } from 'svelte'

import { handleScroll } from '@/components/base/utils'
import { lyricEvent } from '@/modules/lyric/store/event'
import { lyricState, type Line } from '@/modules/lyric/store/state'
import { play, seekTo } from '@/modules/player/actions'
import { playerState } from '@/modules/player/store/state'
import { settingState } from '@/modules/setting/store/state'
import { formatPlayTime2, throttle } from '@/shared'

export const useLyric = (options: {
  domLyric: HTMLElement | undefined
  domLyricText: HTMLElement | undefined
  domSkipLine: HTMLElement | undefined
  onSetMsDown: (isMsDown: boolean) => void
  onSetStopScroll: (isStop: boolean) => void
  onSetTimeStr: (timeStr: string) => void
}) => {
  let isMsDown = false
  let isStopScroll = false

  let msDownY = 0
  let msDownScrollY = 0
  let timeout: number | null = null
  let cancelScrollFn: null | (() => void) = null
  let domLines: HTMLElement[] = []
  let isSetedLines = false
  let point = {
    x: null as null | number,
    y: null as null | number,
  }
  let time = -1
  let domPreLine: HTMLElement | null = null
  let isSkipMouseEnter = false

  const handleSkipPlay = () => {
    if (time == -1) return
    handleSkipMouseLeave()
    isStopScroll = false
    options.onSetStopScroll(false)
    seekTo(time)

    if (!playerState.playing) play()
  }
  const handleSkipMouseEnter = () => {
    isSkipMouseEnter = true
    clearLyricScrollTimeout()
  }
  const handleSkipMouseLeave = () => {
    isSkipMouseEnter = false
    startLyricScrollTimeout()
  }

  const throttleSetTime = throttle(() => {
    if (!options.domSkipLine) return
    const rect = options.domSkipLine.getBoundingClientRect()
    point.x = rect.x
    point.y = rect.y
    let dom = document.elementFromPoint(point.x, point.y) as HTMLElement | null
    if (domPreLine === dom || !dom) return
    if (dom.tagName == 'SPAN') {
      dom = dom.parentNode!.parentNode as HTMLElement
    } else if (dom.classList.contains('line')) {
      dom = dom.parentNode as HTMLElement
    }
    if ((dom as HTMLElement & { time?: number }).time == null) {
      if (lyricState.lines.length) {
        time = dom.classList.contains('pre') ? 0 : (lyricState.lines.at(-1)?.time ?? 0)
        time = Math.max(time - lyricState.offset - lyricState.tempOffset, 0)
        time /= 1000
        if (time > playerState.progress.maxPlayTime) time = playerState.progress.maxPlayTime
        options.onSetTimeStr(formatPlayTime2(time))
      } else {
        time = -1
        options.onSetTimeStr('--:--')
      }
    } else {
      time = (dom as HTMLElement & { time: number }).time
      time = Math.max(time - lyricState.offset - lyricState.tempOffset, 0)
      time /= 1000
      if (time > playerState.progress.maxPlayTime) time = playerState.progress.maxPlayTime
      options.onSetTimeStr(formatPlayTime2(time))
    }
    domPreLine = dom
  })
  const setTime = () => {
    throttleSetTime()
  }

  const handleScrollLrc = (duration = 300) => {
    oldLine = lyricState.line
    if (!domLines.length || !options.domLyric) return
    if (isSkipMouseEnter) return
    if (isStopScroll) return
    let domP = domLines[Math.max(lyricState.line, 0)] as HTMLElement | null
    if (domP) {
      let offsetTop = domP.offsetTop
      let lineHeight = domP.clientHeight / 2
      if (!settingState.setting['playDetail.isDelayScroll'] && settingState.setting['playDetail.isZoomActiveLrc']) {
        const preDomP = domLines[Math.max(lyricState.line - 1, 0)] as HTMLElement | null
        if (preDomP && preDomP !== domP) offsetTop -= (preDomP.clientHeight - preDomP.clientHeight / 1.1) / 2
        lineHeight *= 1.1
      }
      cancelScrollFn = handleScroll(options.domLyric, offsetTop + lineHeight - options.domLyric.clientHeight * 0.46, duration)
    } else {
      cancelScrollFn = handleScroll(options.domLyric, 0, duration)
    }
  }
  const clearLyricScrollTimeout = () => {
    if (!timeout) return
    clearTimeout(timeout)
    timeout = null
  }
  const startLyricScrollTimeout = () => {
    clearLyricScrollTimeout()
    if (isSkipMouseEnter) return
    timeout = setTimeout(() => {
      timeout = null
      isStopScroll = false
      options.onSetStopScroll(false)
      if (!playerState.playing) return
      handleScrollLrc()
    }, 3000)
  }
  const handleLyricDown = (y: number) => {
    // console.log(event)
    clearDelayScrollTimeout()
    isMsDown = true
    options.onSetMsDown(true)

    msDownY = y
    msDownScrollY = options.domLyric!.scrollTop
  }
  const handleLyricMouseDown = (event: MouseEvent) => {
    handleLyricDown(event.clientY)
  }
  const handleLyricTouchStart = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      const touch = event.changedTouches[0]
      handleLyricDown(touch.clientY)
    }
  }
  const handleMouseMsUp = (event: MouseEvent | TouchEvent) => {
    isMsDown = false
    options.onSetMsDown(false)
  }
  const handleMove = (y: number) => {
    if (isMsDown) {
      if (!isStopScroll && oldLines) {
        isStopScroll = true
        options.onSetStopScroll(true)
      }
      if (cancelScrollFn) {
        cancelScrollFn()
        cancelScrollFn = null
      }
      options.domLyric!.scrollTop = msDownScrollY + msDownY - y
      startLyricScrollTimeout()
      setTime()
    }
  }
  const handleMouseMsMove = (event: MouseEvent) => {
    handleMove(event.clientY)
  }
  const handleTouchMove = (e: TouchEvent) => {
    if (e.changedTouches.length) {
      const touch = e.changedTouches[0]
      handleMove(touch.clientY)
    }
  }

  const handleWheel = (event: WheelEvent) => {
    console.log(event.deltaY)
    if (!isStopScroll && oldLines) {
      isStopScroll = true
      options.onSetStopScroll(true)
    }
    if (cancelScrollFn) {
      cancelScrollFn()
      cancelScrollFn = null
    }
    options.domLyric!.scrollTop = options.domLyric!.scrollTop + event.deltaY
    startLyricScrollTimeout()
    setTime()
  }

  const setLyric = (lines: Line[]) => {
    const domLineContent = document.createDocumentFragment()
    for (const line of lines) {
      domLineContent.appendChild(line.dom_line)
    }
    options.domLyricText!.textContent = ''
    options.domLyricText!.appendChild(domLineContent)
    void tick().then(() => {
      domLines = Array.from(options.domLyric!.querySelectorAll('.line-content'))
      handleScrollLrc()
    })
  }

  let oldLines = 0
  const initLrc = (lines: Line[]) => {
    if (isStopScroll) {
      isStopScroll = false
      options.onSetStopScroll(false)
      clearLyricScrollTimeout()
    }
    clearDelayScrollTimeout()
    isSetedLines = true
    if (oldLines) {
      if (lines.length) {
        setLyric(lines)
      } else {
        cancelScrollFn = handleScroll(
          options.domLyric!,
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

  let delayScrollTimeout: number | null
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

    if (settingState.setting['playDetail.isDelayScroll']) {
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
    const unsub = lyricEvent.on('linesChanged', initLrc)
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

    initLrc(lyricState.lines)
    return () => {
      unsub()
      unsub2()
      document.removeEventListener('mousemove', handleMouseMsMove)
      document.removeEventListener('mouseup', handleMouseMsUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseMsUp)
      clearLyricScrollTimeout()
      clearDelayScrollTimeout()
    }
  })

  return {
    isStopScroll,
    isMsDown,
    handleLyricMouseDown,
    handleLyricTouchStart,
    handleWheel,
    handleSkipPlay,
    handleSkipMouseEnter,
    handleSkipMouseLeave,
    handleScrollLrc,
  }
}
