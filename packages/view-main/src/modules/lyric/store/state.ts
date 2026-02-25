export interface Line {
  text: string
  time: number
  extendedLyrics: string[]
  dom_line: HTMLDivElement
}
export interface InitState {
  lines: Line[]
  text: string
  line: number
  offset: number // 歌词延迟
  tempOffset: number // 歌词临时延迟
}

export const lyricState: InitState = {
  lines: [],
  text: '',
  line: 0,
  offset: 0, // 歌词延迟
  tempOffset: 0, // 歌词临时延迟
}
