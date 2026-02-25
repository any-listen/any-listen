import { onRelease } from '@/modules/app/shared'
import { onSettingChanged } from '@/modules/setting/shared'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { setPlaybackRate, setPreservesPitch } from '@/plugins/player'
import { createUnsubscriptionSet, debounce } from '@/shared'

import { onPlayerCreated } from '../shared'
import { setStatePlaybackRate } from '../store/actions'
import { playerEvent } from '../store/event'

let rate = 0
let setValCount = 0
const clearCountDelay = debounce(() => {
  setValCount = 0
}, 2000)
const handleSave = debounce(() => {
  void updateSetting({ 'player.playbackRate': rate })
  setValCount++
  clearCountDelay()
}, 500)
const handleSetPlaybackRate = (num: number) => {
  rate = num < 0 ? 0 : num
  setPlaybackRate(rate)
  setStatePlaybackRate(rate)
  handleSave()
}

let setPitchValCount = 0
const clearPitchCountDelay = debounce(() => {
  setPitchValCount = 0
}, 2000)
const handleSavePitch = debounce((val: boolean) => {
  void updateSetting({ 'player.preservesPitch': val })
  setPitchValCount++
  clearPitchCountDelay()
}, 500)
const handleSetPreservesPitch = (val: boolean) => {
  setPreservesPitch(val)
  handleSavePitch(val)
}

let unregistered = createUnsubscriptionSet()
export const initPlaybackRate = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        onSettingChanged('player.playbackRate', (val) => {
          if (setValCount > 0) setValCount--
          else setPlaybackRate(val)
        })
      )
      unregistered.add(
        playerEvent.on('setPlaybackRate', (val) => {
          handleSetPlaybackRate(val)
        })
      )

      unregistered.add(
        onSettingChanged('player.preservesPitch', (val) => {
          if (setPitchValCount > 0) setPitchValCount--
          else setPreservesPitch(val)
        })
      )
      unregistered.add(
        playerEvent.on('setPreservesPitch', (val) => {
          handleSetPreservesPitch(val)
        })
      )
    })

    setPlaybackRate(settingState.setting['player.playbackRate'])
    setPreservesPitch(settingState.setting['player.preservesPitch'])
  })
}
