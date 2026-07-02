import { onMount } from 'svelte'

import { lyricEvent } from '@/modules/lyric/store/event'
import { lyricState, type Line } from '@/modules/lyric/store/state'

export default (domLyricContent: HTMLElement) => {
  const line1 = document.createElement('div')
  const line2 = document.createElement('div')
  line1.classList.add('top')
  line2.classList.add('bottom')
  domLyricContent.appendChild(line1)
  domLyricContent.appendChild(line2)

  const lineEls = [line1, line2]
  const lineIndexes = [-1, -1]
  let lines: Line[] = []
  let nextLineTimer: number | null = null

  const clearNextLineTimer = () => {
    if (!nextLineTimer) return
    clearTimeout(nextLineTimer)
    nextLineTimer = null
  }

  const setSlotLine = (slot: 0 | 1, line: number) => {
    if (!lines[line]) return
    lineIndexes[slot] = line
    lineEls[slot].replaceChildren(lines[line].dom_line)
  }

  const setWindow = (line: number) => {
    if (!lines.length) {
      line1.replaceChildren()
      line2.replaceChildren()
      lineIndexes[0] = -1
      lineIndexes[1] = -1
      return
    }

    clearNextLineTimer()
    const currentLine = Math.max(line, 0)
    setSlotLine(0, currentLine)
    setSlotLine(1, currentLine + 1)
  }

  const initLrc = (_lines: Line[]) => {
    lines = _lines
    setWindow(lyricState.line)
  }

  const handleNextLine = (currentLine: number, prevLine: number) => {
    const line = Math.max(currentLine, 0)
    const isSequential = prevLine >= 0 && line - prevLine == 1
    if (!isSequential) {
      setWindow(line)
      return
    }

    const activeSlot = lineIndexes[0] == line ? 0 : lineIndexes[1] == line ? 1 : -1
    if (activeSlot < 0) {
      setWindow(line)
      return
    }

    const slot = activeSlot as 0 | 1
    const inactiveSlot = (1 - slot) as 0 | 1

    clearNextLineTimer()
    nextLineTimer = setTimeout(() => {
      setSlotLine(inactiveSlot, line + 1)
      nextLineTimer = null
    }, 220)
  }

  onMount(() => {
    const unsub1 = lyricEvent.on('linesChanged', initLrc)
    initLrc(lyricState.lines)

    let preLine = -1
    const unsub2 = lyricEvent.on('lineChanged', (text, line) => {
      if (preLine == line) return
      handleNextLine(line, preLine)
      preLine = line
    })

    return () => {
      unsub1()
      unsub2()
      clearNextLineTimer()
    }
  })
}
