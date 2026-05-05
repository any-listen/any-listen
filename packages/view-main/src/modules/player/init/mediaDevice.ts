/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { onRelease } from '@/modules/app/shared'
import { onSettingChanged } from '@/modules/setting/shared'
import { settingState } from '@/modules/setting/store/state'
import { setMediaDeviceId } from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { getMediaDeviceIdSetting, getMediaDevices, pause, saveMediaDeviceIdSetting } from '../store/actions'
import { playerEvent } from '../store/event'
import { playerState } from '../store/state'

let unregistered = createUnsubscriptionSet()

let prevDeviceLabel: string | null = null
let prevDeviceId = ''

let isShowingTipAlert = false

const getMediaDevice = async (deviceId: string) => {
  const devices = await getMediaDevices()
  // console.log(devices, deviceId)
  let device = devices.find((device) => device.deviceId === deviceId)
  if (!device) {
    deviceId = 'default'
    device = devices.find((device) => device.deviceId === deviceId)
  }

  if (!device && !devices.length && !isShowingTipAlert) {
    // TODO tip
    // isShowingTipAlert = true
    // void dialog({
    //   message: window.i18n.t('media_device__emtpy_device_tip'),
    //   confirmButtonText: window.i18n.t('ok'),
    // }).finally(() => {
    //   isShowingTipAlert = false
    // })
  }

  return device ? { label: device.label, deviceId: device.deviceId } : { label: '', deviceId: '' }
}
const setMediaDevice = async (deviceId: string, label: string) => {
  // console.log('setMediaDevice', deviceId, label)
  prevDeviceLabel = label
  setMediaDeviceId(deviceId)
    .then(() => {
      prevDeviceId = deviceId
      void saveMediaDeviceIdSetting(deviceId)
    })
    .catch((err: Error) => {
      console.log(err)
      void setMediaDeviceId('default').finally(() => {
        prevDeviceId = 'default'
        void saveMediaDeviceIdSetting('default')
      })
    })
}
const handleDeviceChangeStopPlay = (label: string) => {
  // console.log(device)
  // console.log(appSetting['player.isMediaDeviceChangedPausePlay'], isPlay.value, label, prevDeviceLabel)
  if (settingState.setting['player.isMediaDeviceChangedPausePlay'] && playerState.playing && label != prevDeviceLabel) pause()
}
const handleMediaListChange = async () => {
  const mediaDeviceId = getMediaDeviceIdSetting()
  const device = await getMediaDevice(mediaDeviceId)

  handleDeviceChangeStopPlay(device.label)

  if (device.deviceId == mediaDeviceId) prevDeviceLabel = device.label
  else void setMediaDevice(device.deviceId, device.label)
}

export const initMediaDevice = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      if (import.meta.env.VITE_IS_DESKTOP) {
        unregistered.add(
          onSettingChanged('player.mediaDeviceId', (id) => {
            playerEvent.mediaDeviceChanged(id)
          })
        )
      }
      unregistered.add(
        playerEvent.on('mediaDeviceChanged', (id) => {
          if (prevDeviceId == id) return
          void getMediaDevice(id).then(async ({ deviceId, label }) => setMediaDevice(deviceId, label))
        })
      )

      navigator.mediaDevices?.addEventListener('devicechange', handleMediaListChange)
      unregistered.add(() => {
        navigator.mediaDevices?.removeEventListener('devicechange', handleMediaListChange)
      })
    })

    void getMediaDevice(getMediaDeviceIdSetting()).then(async ({ deviceId, label }) => setMediaDevice(deviceId, label))
  })
}
