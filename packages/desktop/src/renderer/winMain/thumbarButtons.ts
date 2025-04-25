import { appEvent } from '@/app'
import { getPlayerMusic } from '@/modules/player'
import { playerEvent } from '@any-listen/app/modules/player'
import { setThumbarButtons } from './main'

const taskBarButtonFlags: AnyListen.TaskBarButtonFlags = {
  empty: true,
  collect: false,
  play: false,
  next: true,
  prev: true,
}
export const initThumbarButtons = () => {
  appEvent.on('updated_config', (keys, setting) => {
    if (keys.includes('common.langId')) {
      setThumbarButtons(taskBarButtonFlags)
    }
  })

  playerEvent.on('musicChanged', () => {
    void getPlayerMusic().then(async (music) => {
      taskBarButtonFlags.empty = music == null
      setThumbarButtons(taskBarButtonFlags)
    })
  })
  playerEvent.on('status', ([_, isPlaying]) => {
    taskBarButtonFlags.play = isPlaying
    if (taskBarButtonFlags.empty) return
    setThumbarButtons(taskBarButtonFlags)
  })
  playerEvent.on('collectStatus', (status) => {
    taskBarButtonFlags.collect = status
    if (taskBarButtonFlags.empty) return
    setThumbarButtons(taskBarButtonFlags)
  })
}
