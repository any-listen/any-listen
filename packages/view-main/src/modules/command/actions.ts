import { VIEW_MAIN_ALL_COMMANDS } from '@any-listen/common/command'

import { commandEvent } from './event'

export const executeCommand = async (command: string, ...args: unknown[]): Promise<unknown> => {
  if (VIEW_MAIN_ALL_COMMANDS.includes(command as (typeof VIEW_MAIN_ALL_COMMANDS)[number])) {
    return commandEvent.viewMainCommand(command as (typeof VIEW_MAIN_ALL_COMMANDS)[number], ...args)
  }
  return commandEvent.mainCommand(command, ...args)
}

export const executeLocalCommand = async (cmd: (typeof VIEW_MAIN_ALL_COMMANDS)[number], ...args: unknown[]) => {
  return commandEvent.viewMainCommand(cmd, ...args)
}
