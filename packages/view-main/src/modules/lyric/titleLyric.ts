import { winShowEvent } from '@/shared/ipc/app/event'

import { appEvent } from '../app/store/event'
import { playerEvent } from '../player/store/event'
import { playerState } from '../player/store/state'
import { settingEvent } from '../setting/store/event'
import { settingState } from '../setting/store/state'
import { getDisabledAutoPause, getDisabledAutoPauseSize, setDisabledAutoPause } from './lyric'
import { lyricEvent } from './store/event'

export const initTitleLyric = () => {
  let lrc: string | null = null
  let preText: string | null = null
  let enabled = false
  const resetLyric = () => {
    preText = null
  }
  const setLyric = (lyric: string | null = lrc, force = false) => {
    if (lrc != lyric) lrc = lyric
    if (!enabled || lyric == null) return
    const text = playerState.playing ? lrc || '...' : null
    if (preText === text && !force) return
    preText = text
    lyricEvent.titleLyricChanged(text)
  }

  if (settingState.setting['player.isShowTitleLyric']) {
    setDisabledAutoPause(true, 'titleLyric')
  }
  if (settingState.setting['player.isShowMediaSessionLyric']) {
    setDisabledAutoPause(true, 'mediaSessionLyric')
  }
  enabled = getDisabledAutoPause()

  const unsub = settingEvent.on('updated', (keys, settings) => {
    let updated = false
    if (keys.includes('player.isShowTitleLyric')) {
      updated ||= true
      setDisabledAutoPause(settings['player.isShowTitleLyric']!, 'titleLyric')
    }
    if (keys.includes('player.isShowMediaSessionLyric')) {
      updated ||= true
      setDisabledAutoPause(settings['player.isShowMediaSessionLyric']!, 'mediaSessionLyric')
    }
    if (updated) {
      enabled = getDisabledAutoPause()
      if (enabled) {
        setLyric(lrc, true)
      } else {
        resetLyric()
      }
    }
  })
  const unsub2 = lyricEvent.on('lineChanged', (text, line) => {
    text = text.trim()
    if (!text && line <= 0) {
      lrc = null
      resetLyric()
      return
    }
    setLyric(text)
  })
  const unsub3 = playerEvent.on('playStatusChanged', () => {
    setLyric()
  })
  const unsub4 = winShowEvent.on((show) => {
    if (!settingState.setting['player.isShowTitleLyric'] || getDisabledAutoPauseSize() > 1) {
      return
    }
    if (show) {
      setDisabledAutoPause(true, 'titleLyric')
      setLyric()
    } else {
      setDisabledAutoPause(false, 'titleLyric')
      resetLyric()
    }
  })
  const handleVisibleChanged = (show: boolean) => {
    if (show) {
      setDisabledAutoPause(false)
    } else {
      setDisabledAutoPause(true)
    }
  }
  const unsub5 = appEvent.on('visible', handleVisibleChanged)
  handleVisibleChanged(!document.hidden)

  return () => {
    unsub()
    unsub2()
    unsub3()
    unsub4()
    unsub5()
  }
}
