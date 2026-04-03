import { internalExtensionContextState } from '../internalExtension/state'
import { extensionState } from '../state'
import { executeCommand as executeExtensionCommand } from '../vm/hostContext/preloadFuncs'

export const executeCommand = (fullCommand: string, args: any[]) => {
  const targetCommand = extensionState.resourceList.commands.find((c) => c.fullCommand == fullCommand)
  if (!targetCommand) throw new Error(`Command ${fullCommand} not found`)
  const context = internalExtensionContextState.contexts.get(targetCommand.extensionId)
  if (context) return context.context.executeCommand!(targetCommand.command, args)
  return executeExtensionCommand(targetCommand.extensionId, targetCommand.command, args)
}

export const createCommand = (extension: AnyListen.Extension.Extension) => {
  return {
    executeCommand,
    async getCommands(filterInternal = false) {
      return extensionState.resourceList.commands.map((c) => c.fullCommand)
    },
  } as const
}
