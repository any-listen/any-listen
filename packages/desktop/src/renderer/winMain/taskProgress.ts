import { appEvent, appState } from '@/app'
import { playerEvent } from '@any-listen/app/modules/player'
import { setProgressBar } from './main'

let unsubscribes = new Set<() => void>()

const updateProgressShow = (isShow: boolean) => {
  for (const s of unsubscribes) s()
  unsubscribes.clear()
  if (isShow) {
    let progress = 0
    let mode: Electron.ProgressBarOptions['mode'] = 'none'
    unsubscribes.add(
      playerEvent.on('progress', (info) => {
        progress = info.progress
        if (progress > 0 && progress < 0.01) progress = 0.01
        setProgressBar(progress, { mode })
      })
    )
    unsubscribes.add(
      playerEvent.on('status', ([status]) => {
        let newMode: Electron.ProgressBarOptions['mode']
        switch (status) {
          case 'playing':
            newMode = 'normal'
            break
          case 'loading':
          case 'stoped':
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
        setProgressBar(progress, { mode })
      })
    )
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
}
