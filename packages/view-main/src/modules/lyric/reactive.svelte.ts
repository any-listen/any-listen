import { readable } from 'svelte/store'

import { lyricEvent } from './store/event'
import { lyricState } from './store/state'

const getLyricLine = () => lyricState.lines[lyricState.line] ?? { line: 0, text: '' }

export const lyricLines = readable(lyricState.lines, (set) => {
  set(lyricState.lines)
  return lyricEvent.on('linesChanged', (lines) => {
    set(lines)
  })
})

export const lyricLine = readable(getLyricLine(), (set) => {
  set(getLyricLine())
  return lyricEvent.on('lineChanged', () => {
    set(getLyricLine())
  })
})
