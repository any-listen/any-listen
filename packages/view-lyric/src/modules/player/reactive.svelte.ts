import { readable } from 'svelte/store'

import { playerEvent } from './store/event'
import { playerState } from './store/state'

export const musicInfo = readable(playerState.musicInfo, (set) => {
  const handleUpdate = () => {
    set(playerState.musicInfo)
  }
  handleUpdate()
  playerEvent.on('musicInfoChanged', handleUpdate)

  return function stop() {
    playerEvent.off('musicInfoChanged', handleUpdate)
  }
})

export const statusText = readable(playerState.statusText, (set) => {
  const handleUpdate = () => {
    set(playerState.statusText)
  }
  handleUpdate()
  playerEvent.on('statusTextChanged', handleUpdate)

  return function stop() {
    playerEvent.off('statusTextChanged', handleUpdate)
  }
})

export const playing = readable(playerState.playing, (set) => {
  const handleUpdate = () => {
    set(playerState.playing)
  }
  handleUpdate()
  playerEvent.on('playStatusChanged', handleUpdate)

  return function stop() {
    playerEvent.off('playStatusChanged', handleUpdate)
  }
})

export const playerPlaying = readable(playerState.playerPlaying, (set) => {
  const handleUpdate = () => {
    set(playerState.playerPlaying)
  }
  handleUpdate()
  playerEvent.on('playerPlayStatusChanged', handleUpdate)

  return function stop() {
    playerEvent.off('playerPlayStatusChanged', handleUpdate)
  }
})

export const progress = readable(playerState.progress, (set) => {
  const handleUpdate = () => {
    set(playerState.progress)
  }
  handleUpdate()
  playerEvent.on('progressChanged', handleUpdate)

  return function stop() {
    playerEvent.off('progressChanged', handleUpdate)
  }
})

export const duration = readable(
  { label: playerState.progress.maxPlayTimeStr, duration: playerState.progress.maxPlayTime },
  (set) => {
    const handleUpdate = () => {
      set({ label: playerState.progress.maxPlayTimeStr, duration: playerState.progress.maxPlayTime })
    }
    handleUpdate()
    playerEvent.on('durationChanged', handleUpdate)

    return function stop() {
      playerEvent.off('durationChanged', handleUpdate)
    }
  }
)

export const volume = readable(playerState.volume, (set) => {
  const handleUpdate = () => {
    set(playerState.volume)
  }
  handleUpdate()
  return playerEvent.on('volumeChanged', handleUpdate)
})

export const volumeMute = readable(playerState.volumeMute, (set) => {
  const handleUpdate = () => {
    set(playerState.volumeMute)
  }
  handleUpdate()
  return playerEvent.on('volumeMuteChanged', handleUpdate)
})

export const usePlaybackRate = () => {
  let rate = $state.raw<number>(playerState.playbackRate)

  $effect(() => {
    rate = playerState.playbackRate
    return playerEvent.on('playbackRateUpdated', (r) => {
      rate = r
    })
  })

  return {
    get val() {
      return rate
    },
  }
}
