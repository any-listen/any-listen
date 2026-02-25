import { onRelease } from '@/modules/app/shared'
import { hotkeyEvent } from '@/modules/hotkey/store/event'
import { onSettingChanged } from '@/modules/setting/shared'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { setMute, setVolume } from '@/plugins/player'
import { createUnsubscriptionSet, debounce } from '@/shared'

import { onPlayerCreated } from '../shared'
import { setStateVolume, setStateVolumeMute } from '../store/actions'
import { playerEvent } from '../store/event'

let volume = 0
let setVolumeCount = 0
let isMute = false
let setMuteCount = 0

const clearVolumeCountDelay = debounce(() => {
  setVolumeCount = 0
}, 2000)

const handleSaveVolume = debounce(() => {
  void updateSetting({ 'player.volume': volume })
  setVolumeCount++
  clearVolumeCountDelay()
}, 500)
const handleSetVolume = (num: number) => {
  volume = num < 0 ? 0 : num > 1 ? 1 : num
  setVolume(volume)
  setStateVolume(volume)
  handleSaveVolume()
}
const clearMuteCountDelay = debounce(() => {
  setMuteCount = 0
}, 2000)
const handleToggleVolumeMute = (_isMute?: boolean) => {
  let muteStatus = _isMute ?? isMute
  setMute(muteStatus)
  setStateVolumeMute(muteStatus)
  void updateSetting({ 'player.isMute': muteStatus })
  setMuteCount++
  clearMuteCountDelay()
}

let unregistered = createUnsubscriptionSet()
export const initVolume = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        onSettingChanged('player.volume', (val) => {
          if (setVolumeCount > 0) setVolumeCount--
          else {
            setVolume(val)
            setStateVolume(val)
          }
        })
      )
      unregistered.add(
        onSettingChanged('player.isMute', (val) => {
          if (setMuteCount > 0) setMuteCount--
          else {
            setMute(val)
            setStateVolumeMute(val)
          }
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_volume_up', () => {
          handleSetVolume(volume + 0.04)
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_volume_down', () => {
          handleSetVolume(volume - 0.04)
        })
      )
      unregistered.add(
        hotkeyEvent.on('player_volume_mute', () => {
          handleToggleVolumeMute()
        })
      )
      unregistered.add(
        playerEvent.on('setVolume', (val) => {
          handleSetVolume(val)
        })
      )
      unregistered.add(
        playerEvent.on('setVolumeIsMute', (val) => {
          handleToggleVolumeMute(val)
        })
      )
    })

    setVolume(settingState.setting['player.volume'])
    setMute(settingState.setting['player.isMute'])
    setStateVolume(settingState.setting['player.volume'])
    setStateVolumeMute(settingState.setting['player.isMute'])
  })
}
