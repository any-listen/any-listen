import { initPlayStatus } from './playStatus'
import { initProgress } from './progress'

export const initPlayer = () => {
  initPlayStatus()
  initProgress()
}
