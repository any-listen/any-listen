import { lyricEvent } from './event'
import { type Line, lyricState } from './state'

export const setLines = (lines: Line[]) => {
  if (!lines.length && !lyricState.lines.length) return
  lyricState.lines = lines
  lyricEvent.linesChanged(lines)
}
export const setText = (text: string, line: number) => {
  if (lyricState.text === text && lyricState.line === line) return
  lyricState.text = text
  lyricState.line = line
  lyricEvent.lineChanged(text, line)
}
export const setOffset = (offset: number) => {
  lyricState.offset = offset
}
