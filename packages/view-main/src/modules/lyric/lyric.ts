import Lyric from '@any-listen/web/lyric-font-player'
import { setLines, setTempOffset, setText } from './store/action'
// import { setStatusText } from '@/modules/player/store/actions'
import { clearTimeoutBg, setTimeoutBg } from '@/shared/tools'
import { settingState } from '../setting/store/state'
import type { Line } from './store/state'

let lrc: Lyric | null

export const setOffset = (offset: number) => {
  lrc?.setOffset(offset)
  setTempOffset(offset)
}

export const setPlaybackRate = (rate: number) => {
  lrc?.setPlaybackRate(rate)
}

export const setLyric = (lrcStr: string, extLrc: string[]) => {
  lrc?.setLyric(lrcStr, extLrc)
}

let sources = new Set<string>()
let prevDisabled = false
let tempDisabled = false
export const setDisabledAutoPause = (disabled: boolean, source?: 'statusBarLyric' | 'titleLyric' | 'mediaSessionLyric') => {
  let currentDisabled = prevDisabled
  if (source) {
    sources[disabled ? 'add' : 'delete'](source)
    if (tempDisabled) currentDisabled = sources.size > 0
  } else {
    tempDisabled = disabled
    if (!sources.size) return
    currentDisabled = disabled
  }
  if (prevDisabled == currentDisabled) return
  prevDisabled = currentDisabled
  if (!currentDisabled) {
    lrc?.setTimeoutTools()
    return
  }
  lrc?.setTimeoutTools({
    setTimeout: setTimeoutBg,
    clearTimeout: clearTimeoutBg,
    nextTick: (handler: () => void) => {
      return setTimeoutBg(handler, 60)
    },
    cancelNextTick: clearTimeoutBg,
  })
}
export const getDisabledAutoPause = () => {
  return sources.size > 0
}
export const getDisabledAutoPauseSize = () => {
  return sources.size
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

export const initLyric = () => {
  lrc = new Lyric({
    shadowContent: false,
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
      setOffset(offset) // 歌词延迟
      setTempOffset(0) // 重置临时延迟
    },
    onUpdateLyric(lines: Line[]) {
      setLines([...lines])
      setText('', -1)
    },
    rate: settingState.setting['player.playbackRate'],
    // offset: 80,
  })
  return () => {
    lrc?.pause()
    lrc = null
  }
}
