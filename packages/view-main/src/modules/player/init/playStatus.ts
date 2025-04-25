import { onRelease } from '@/modules/app/shared'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { setPause } from '@/plugins/player'
import { createUnsubscriptionSet, setTitle } from '@/shared'
import { buildMusicName } from '@any-listen/common/tools'
import { onPlayerCreated } from '../shared'
import { setPlayerPlaying, setStatusText, skipNext } from '../store/actions'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

let unregistered = createUnsubscriptionSet()
export const initPlayStatus = () => {
  onRelease(unregistered.clear.bind(unregistered))
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
          if (playerState.playing) return
          setStatusText(i18n.t('player__paused'))
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
          setTitle(null)
          setStatusText(i18n.t('player__stoped'))
          // TODO
          // setPowerSaveBlocker(false)
        })
      )
      unregistered.add(
        playerEvent.on('musicChanged', () => {
          setTitle(
            playerState.musicInfo.id
              ? buildMusicName(
                  settingState.setting['download.fileName'],
                  playerState.musicInfo.name,
                  playerState.musicInfo.singer
                )
              : null
          )
        })
      )
      unregistered.add(
        playerEvent.on('playerPlaying', () => {
          if (!playerState.playing) setPause()
          // TODO
          // setPowerSaveBlocker(true)
        })
      )
      unregistered.add(
        playerEvent.on('playerEmptied', () => {
          setPlayerPlaying(false)
          // TODO
          // setPowerSaveBlocker(false)
        })
      )
      unregistered.add(
        playerEvent.on('playerEnded', () => {
          setPlayerPlaying(false)
          setStatusText(i18n.t('player__end'))
          void skipNext(true)
        })
      )
    })
  })
}
