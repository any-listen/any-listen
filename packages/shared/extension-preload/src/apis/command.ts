import { hostContext } from '@/host/state'

const commandHandlers = new Map<string, (...args: unknown[]) => Promise<unknown>>()
export const command: AnyListen_API.Command = {
  async registerCommand(commandName, handler) {
    if (commandHandlers.has(commandName)) {
      throw new Error(`Command ${commandName} is already registered`)
    }
    commandHandlers.set(commandName, handler)
    return async () => {
      commandHandlers.delete(commandName)
    }
  },
  async executeCommand(commandName: string, ...args: any[]) {
    if (commandHandlers.has(commandName)) {
      const handler = commandHandlers.get(commandName)!
      return handler(...args)
    }
    return hostContext.hostFuncs.executeCommand(commandName, args)
  },
  async getCommands(filterInternal): Promise<string[]> {
    return hostContext.hostFuncs.getCommands(filterInternal)
  },
}

export const executeCommand = async (commandName: string, args: any[]) => {
  if (!commandHandlers.has(commandName)) throw new Error(`Command ${commandName} not found`)
  const handler = commandHandlers.get(commandName)!
  return handler(...args)
}
