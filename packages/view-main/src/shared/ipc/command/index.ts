import { ipc } from '../ipc'

export const executeCommand = async (cmd: string, ...args: unknown[]) => {
  return ipc.executeCommand(cmd, args)
}
