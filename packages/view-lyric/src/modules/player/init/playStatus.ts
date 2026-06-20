import { onWinMainIPCDisconnected } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { setPlayerPlaying } from '../store/actions'
import { playerEvent } from '../store/event'

let unregistered = createUnsubscriptionSet()
export const initPlayStatus = () => {
  onWinMainIPCDisconnected(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        playerEvent.on('play', () => {
          setPlayerPlaying(true)
        })
      )
      unregistered.add(
        playerEvent.on('pause', () => {
          setPlayerPlaying(false)
        })
      )
      unregistered.add(
        playerEvent.on('error', () => {
          setPlayerPlaying(false)
        })
      )
      unregistered.add(
        playerEvent.on('stop', () => {
          setPlayerPlaying(false)
        })
      )
      unregistered.add(
        playerEvent.on('playerEmptied', () => {
          setPlayerPlaying(false)
        })
      )
      unregistered.add(
        playerEvent.on('playerEnded', () => {
          setPlayerPlaying(false)
        })
      )
    })
  })
}
