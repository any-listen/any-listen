import { onRelease } from '@/modules/app/shared'
import { hotkeyEvent } from '@/modules/hotkey/store/event'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { collectMusic, dislikeMusic, skipNext, skipPrev, togglePlay, uncollectMusic } from '../store/actions'

let unregistered = createUnsubscriptionSet()
export const initPlayKeyboardAction = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        hotkeyEvent.on('player_next', () => {
          void skipNext()
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_prev', () => {
          void skipPrev()
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_toggle_play', () => {
          togglePlay()
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_music_love', () => {
          void collectMusic()
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_music_unlove', () => {
          uncollectMusic()
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_music_dislike', () => {
          void dislikeMusic()
        })
      )
    })
  })
}
