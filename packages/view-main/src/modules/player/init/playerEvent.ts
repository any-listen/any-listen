import { onRelease } from '@/modules/app/shared'
import {
  getErrorCode,
  onCanplay,
  onEmptied,
  onEnded,
  onError,
  onLoadeddata,
  onLoadstart,
  onPause,
  onPlaying,
  onWaiting,
} from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { playerEvent } from '../store/event'

let unregistered = createUnsubscriptionSet()
export const initPlayerEvent = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        onPlaying(() => {
          console.log('onPlaying')
          playerEvent.playerPlaying()
          playerEvent.play()
        })
      )
      unregistered.add(
        onPause(() => {
          console.log('onPause')
          playerEvent.playerPause()
          playerEvent.pause()
        })
      )
      unregistered.add(
        onEnded(() => {
          console.log('onEnded')
          playerEvent.playerEnded()
          // playerEvent.pause()
        })
      )
      unregistered.add(
        onError(() => {
          console.log('onError')
          const errorCode = getErrorCode()
          playerEvent.error(errorCode)
          playerEvent.playerError(errorCode)
        })
      )
      unregistered.add(
        onLoadeddata(() => {
          console.log('onLoadeddata')
          playerEvent.playerLoadeddata()
        })
      )
      unregistered.add(
        onLoadstart(() => {
          console.log('onLoadstart')
          playerEvent.playerLoadstart()
        })
      )
      unregistered.add(
        onCanplay(() => {
          console.log('onCanplay')
          playerEvent.playerCanplay()
        })
      )
      unregistered.add(
        onEmptied(() => {
          console.log('onEmptied')
          playerEvent.playerEmptied()
          // playerEvent.stop()
        })
      )
      unregistered.add(
        onWaiting(() => {
          console.log('onWaiting')
          playerEvent.pause()
          playerEvent.playerWaiting()
        })
      )
    })
  })
}
