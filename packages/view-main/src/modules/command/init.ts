import { createUnsubscriptionSet } from '@/shared'
import { executeCommand as remoteExecuteCommand } from '@/shared/ipc/command'
import { remoteCommandEvent } from '@/shared/ipc/command/event'

import { onConnected, onRelease } from '../app/shared'
import { executeCommand } from './actions'
import { commandEvent } from './event'

const unregistered = createUnsubscriptionSet()

export const initCommand = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      console.log('mainCommand')
      subscriptions.add(
        commandEvent.register('mainCommand', async (cmd, ...args) => {
          return remoteExecuteCommand(cmd, ...args)
        })
      )
      subscriptions.add(
        remoteCommandEvent.register('viewMainCommand', async (cmd, ...args) => {
          return executeCommand(cmd, ...args)
        })
      )
    })
  })
}
