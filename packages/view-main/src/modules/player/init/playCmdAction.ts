import { onRelease } from '@/modules/app/shared'
import { commandEvent } from '@/modules/command/event'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { collectMusic, dislikeMusic, pause, play, skipNext, skipPrev, togglePlay, uncollectMusic } from '../store/actions'

let unregistered = createUnsubscriptionSet()
export const initPlayCmdAction = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        commandEvent.register('play', async () => {
          play()
        })
      )
      unregistered.add(
        commandEvent.register('pause', async () => {
          pause()
        })
      )
      unregistered.add(
        commandEvent.register('playToggle', async () => {
          togglePlay()
        })
      )
      unregistered.add(
        commandEvent.register('next', async () => {
          void skipNext()
        })
      )
      unregistered.add(
        commandEvent.register('previous', async () => {
          void skipPrev()
        })
      )
      unregistered.add(
        commandEvent.register('favorite', async () => {
          void collectMusic()
        })
      )
      unregistered.add(
        commandEvent.register('unfavorite', async () => {
          uncollectMusic()
        })
      )
      unregistered.add(
        commandEvent.register('dislike', async () => {
          void dislikeMusic()
        })
      )
    })
  })
}
