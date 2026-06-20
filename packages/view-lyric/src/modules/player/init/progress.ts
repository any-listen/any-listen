import { getDocumentHidden, onVisibilityChange } from '@any-listen/web'

import { onWinMainIPCDisconnected } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

let unregistered = createUnsubscriptionSet()
export const initProgress = () => {
  onWinMainIPCDisconnected(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      let documentHidden = getDocumentHidden()
      unregistered.add(
        playerEvent.on('progressChanged', (progress, old) => {
          if (documentHidden) return
          if (Math.abs(progress.progress - old.progress) > 0.01) {
            console.log('activePlayProgressTransition')
            playerEvent.activePlayProgressTransition()
          }
        })
      )

      let currentPlayProgress = 0
      unregistered.add(
        onVisibilityChange((hidden) => {
          documentHidden = hidden
          if (documentHidden) {
            currentPlayProgress = playerState.progress.progress
          } else if (Math.abs(playerState.progress.progress - currentPlayProgress) > 0.01) {
            playerEvent.activePlayProgressTransition()
          }
        })
      )
    })
  })
}
