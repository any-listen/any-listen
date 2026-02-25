import { onRelease } from '@/modules/app/shared'
import { suspendAudioContext } from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'
import { clearTimeoutBg, setTimeoutBg } from '@/shared/tools'

import { onPlayerCreated } from '../shared'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

let unregistered = createUnsubscriptionSet()
let timeoutId: number | null = null
const runSuspendAudioContextTimeout = () => {
  if (timeoutId) return
  timeoutId = setTimeoutBg(() => {
    timeoutId = null
    // Suspend the audio context
    void suspendAudioContext()
  }, 60_000)
}
const stopSuspendAudioContextTimeout = () => {
  if (!timeoutId) return
  clearTimeoutBg(timeoutId)
  timeoutId = null
}

export const initPlayerAudioContext = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        playerEvent.on('playStatusChanged', (status) => {
          if (status) {
            stopSuspendAudioContextTimeout()
          } else {
            runSuspendAudioContextTimeout()
          }
        })
      )
    })

    if (!playerState.playing) {
      runSuspendAudioContextTimeout()
    }
  })
}
