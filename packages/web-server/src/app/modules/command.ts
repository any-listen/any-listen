import { commandEvent } from '@any-listen/app/modules/command/event'
import { MAIN_ALL_COMMANDS, VIEW_MAIN_ALL_COMMANDS } from '@any-listen/common/command'

import { hotKeyEvent, hotKeyState } from './hotKey'

export const executeCommand = async (command: string, ...args: unknown[]) => {
  if (MAIN_ALL_COMMANDS.includes(command as (typeof MAIN_ALL_COMMANDS)[number])) {
    return commandEvent.mainCommand(command as (typeof MAIN_ALL_COMMANDS)[number], ...args)
  }
  if (VIEW_MAIN_ALL_COMMANDS.includes(command as (typeof VIEW_MAIN_ALL_COMMANDS)[number])) {
    return commandEvent.viewMainCommand(command, ...args)
  }
  return commandEvent.extensionCommand(command, args)
}

export const initCommand = async () => {
  hotKeyEvent.on('hot_key_down', (key) => {
    const command = hotKeyState.config.global.keys[key]
    if (!command) return
    void executeCommand(command)
  })
}
