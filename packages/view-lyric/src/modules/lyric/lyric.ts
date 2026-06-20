import Lyric from '@any-listen/web/lyric-font-player'

import { settingState } from '../setting/store/state'
import { setLines, setOffset as setStoreOffset, setText } from './store/action'
import type { Line } from './store/state'

let lrc: Lyric | null

export const setOffset = (offset: number) => {
  lrc?.setOffset(offset)
}

export const setPlaybackRate = (rate: number) => {
  lrc?.setPlaybackRate(rate)
}

export const setLyric = (lrcStr: string, extLrc: string[]) => {
  lrc?.setLyric(lrcStr, extLrc)
}

export const play = (currentTime: number) => {
  lrc?.play(currentTime)
}
export const pause = () => {
  lrc?.pause()
}

export const stop = () => {
  lrc?.setLyric('')
  setText('', -1)
}
export const setVertical = (isVertical: boolean) => {
  lrc?.setVertical(isVertical)
}

export const initLyric = () => {
  lrc = new Lyric({
    shadowContent: true,
    activeLineClassName: 'active',
    rate: settingState.setting['player.playbackRate'],
    isVertical: settingState.setting['desktopLyric.direction'] == 'vertical',
    onPlay(line: number, text: string) {
      setText(text, line)
      // setStatusText(text)
      // console.log('onPlay', line, text)
    },
    onSetLyric(lines: Line[], offset: number) {
      // listening lyrics seting event
      // console.log(lines) // lines is array of all lyric text
      setLines([...lines])
      setText('', -1)
      setStoreOffset(offset)
    },
    onUpdateLyric(lines: Line[]) {
      setLines([...lines])
      setText('', -1)
    },
    // offset: 80,
  })
  return () => {
    lrc?.pause()
    lrc = null
  }
}
