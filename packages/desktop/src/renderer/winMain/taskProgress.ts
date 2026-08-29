import { playerEvent } from '@any-listen/app/modules/player'

import { appEvent, appState } from '@/app'

import { setProgressBar } from './main'

let unsubscribes = new Set<() => void>()
const state = {
  process: 0,
  status: 'stopped' as AnyListen.IPCPlayer.PlayerStatus,
}

const updateProgressShow = (isShow: boolean) => {
  for (const s of unsubscribes) s()
  unsubscribes.clear()
  if (isShow) {
    let progress = 0
    let mode: Electron.ProgressBarOptions['mode'] = 'none'
    const getProgress = (_progress: number) => {
      progress = _progress
      if (progress > 0 && progress < 0.01) progress = 0.01
      return progress
    }
    const getMode = (status: AnyListen.IPCPlayer.PlayerStatus) => {
      let newMode: Electron.ProgressBarOptions['mode']
      switch (status) {
        case 'playing':
          newMode = 'normal'
          break
        case 'loading':
        case 'stopped':
        case 'ended':
        case 'paused':
        case 'buffering':
          newMode = 'paused'
          break
        case 'error':
          newMode = 'error'
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          newMode = 'none'
          break
      }
      if (mode == newMode) return
      mode = newMode
      return mode
    }
    unsubscribes.add(
      playerEvent.on('progress', (info) => {
        setProgressBar(getProgress(info.progress), { mode })
      })
    )
    unsubscribes.add(
      playerEvent.on('status', ([status]) => {
        const mode = getMode(status)
        if (mode == null) return
        setProgressBar(progress, { mode })
      })
    )
    setProgressBar(getProgress(state.process), { mode: getMode(state.status) ?? mode })
  } else {
    setProgressBar(-1, { mode: 'none' })
  }
}

export const initTaskProgress = () => {
  if (appState.appSetting['player.isShowTaskProgess']) {
    updateProgressShow(true)
  }
  appEvent.on('updated_config', (keys, setting) => {
    if (keys.includes('player.isShowTaskProgess')) {
      updateProgressShow(setting['player.isShowTaskProgess']!)
    }
  })
  playerEvent.on('progress', (info) => {
    state.process = info.progress
  })
  playerEvent.on('status', ([status]) => {
    state.status = status
  })
}
