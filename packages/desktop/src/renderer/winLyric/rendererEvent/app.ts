import type { ExposeFunctions } from '.'
import { winLyricEvent } from '../event'
import { getBounds, setBounds } from '../main'
import { mouseCheckTools } from '../mouseCheckTools'
import { getLyricWindowBounds } from '../utils'

// 暴露给前端的方法
export const createExposeApp = (ipc: AnyListen.IPC_Lyric.ClientIPC) => {
  return {
    async inited() {
      winLyricEvent.inited()
    },
    async setWinBounds(event, bounds) {
      setBounds(getLyricWindowBounds(getBounds()!, bounds))
    },
    async mouseEnterLeave(event, isEnter) {
      if (isEnter) {
        mouseCheckTools.setMouseInWindow(true)
        mouseCheckTools.runCheck(() => {
          void ipc.mouseLeave()
        })
      } else {
        mouseCheckTools.setMouseInWindow(false)
        mouseCheckTools.cacnelCheck()
      }
    },
  } satisfies Partial<ExposeFunctions>
}
