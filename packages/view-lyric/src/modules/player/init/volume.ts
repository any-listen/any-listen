import { onWinMainIPCDisconnected } from '@/modules/app/shared'
import { onSettingChanged } from '@/modules/setting/shared'
import { settingState } from '@/modules/setting/store/state'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { setStateVolume, setStateVolumeMute } from '../store/actions'

let unregistered = createUnsubscriptionSet()
export const initVolume = () => {
  onWinMainIPCDisconnected(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        onSettingChanged('player.volume', (val) => {
          setStateVolume(val)
        })
      )
      unregistered.add(
        onSettingChanged('player.isMute', (val) => {
          setStateVolumeMute(val)
        })
      )
    })

    setStateVolume(settingState.setting['player.volume'])
    setStateVolumeMute(settingState.setting['player.isMute'])
  })
}
