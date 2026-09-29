import { remoteCommandEvent } from './event'

export default {
  async executeCommand(command, args) {
    return remoteCommandEvent.viewMainCommand(command, ...args)
  },
} satisfies Partial<AnyListen.IPC.ClientIPC>
