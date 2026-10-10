import { downloadListActionEvent } from './event'

export default {
  async downloadListAction(items) {
    downloadListActionEvent.emit(items)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
