import { mouseLeaveEvent } from './event'

export default {
  async mouseLeave() {
    mouseLeaveEvent.emit()
  },
} satisfies Partial<AnyListen.IPC_Lyric.ClientIPC>
