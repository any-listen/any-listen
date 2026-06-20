import { onMount } from 'svelte'

import { playerEvent } from '@/modules/player/store/event'
import { playerState } from '@/modules/player/store/state'
import { onSettingChanged } from '@/modules/setting/shared'
import { settingState } from '@/modules/setting/store/state'

export default () => {
  let isHide = $state(false)
  let timeout: number | null = null
  const clearIntv = () => {
    if (!timeout) return
    clearTimeout(timeout)
    timeout = null
  }
  const handlePlayChange = () => {
    clearIntv()
    if (!settingState.setting['desktopLyric.pauseHide']) return
    if (playerState.playerPlaying) {
      isHide &&= false
    } else {
      timeout = setTimeout(() => {
        timeout = null
        isHide = true
      }, 200)
    }
  }
  onMount(() => {
    const unsub = playerEvent.on('playerPlayStatusChanged', handlePlayChange)
    const unsub2 = onSettingChanged('desktopLyric.pauseHide', (val) => {
      if (!val) {
        isHide &&= false
        clearIntv()
        return
      }
      handlePlayChange()
    })
    handlePlayChange()

    return () => {
      unsub()
      unsub2()
      clearIntv()
    }
  })

  return {
    get val() {
      return isHide
    },
  }
}
