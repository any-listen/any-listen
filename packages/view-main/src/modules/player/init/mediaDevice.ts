/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { onRelease } from '@/modules/app/shared'
import { onSettingChanged } from '@/modules/setting/shared'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { setMediaDeviceId } from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'
import { pause } from '../store/actions'
import { playerState } from '../store/state'

let unregistered = createUnsubscriptionSet()

let prevDeviceLabel: string | null = null
let prevDeviceId = ''

const saveMediaDeviceId = (id: string) => {
  if (settingState.setting['player.mediaDeviceId'] == id) return
  void updateSetting({ 'player.mediaDeviceId': id })
}

const getDevices = async () => {
  const devices = (navigator.mediaDevices ? await navigator.mediaDevices.enumerateDevices() : [])
    .filter(({ kind }) => kind == 'audiooutput')
    .map((d) => {
      return {
        deviceId: d.deviceId || 'default',
        label: d.label || 'default',
      }
    })
  if (!devices.length) devices.push({ deviceId: 'default', label: 'default' })
  return devices
}

let isShowingTipAlert = false

const getMediaDevice = async (deviceId: string) => {
  const devices = await getDevices()
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
  prevDeviceLabel = label
  // console.log(device)
  setMediaDeviceId(deviceId)
    .then(() => {
      prevDeviceId = deviceId
      saveMediaDeviceId(deviceId)
    })
    .catch((err: Error) => {
      console.log(err)
      void setMediaDeviceId('default').finally(() => {
        prevDeviceId = 'default'
        saveMediaDeviceId('default')
      })
    })
}
const handleDeviceChangeStopPlay = (label: string) => {
  // console.log(device)
  // console.log(appSetting['player.isMediaDeviceChangedPausePlay'], isPlay.value, label, prevDeviceLabel)
  if (settingState.setting['player.isMediaDeviceChangedPausePlay'] && playerState.playing && label != prevDeviceLabel) pause()
}
const handleMediaListChange = async () => {
  const mediaDeviceId = settingState.setting['player.mediaDeviceId']
  const device = await getMediaDevice(mediaDeviceId)

  handleDeviceChangeStopPlay(device.label)

  if (device.deviceId == mediaDeviceId) prevDeviceLabel = device.label
  else void setMediaDevice(device.deviceId, device.label)
}

export const initMediaDevice = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        onSettingChanged('player.mediaDeviceId', (id) => {
          if (prevDeviceId == id) return
          void getMediaDevice(id).then(async ({ deviceId, label }) => setMediaDevice(deviceId, label))
        })
      )

      navigator.mediaDevices?.addEventListener('devicechange', handleMediaListChange)
      unregistered.add(() => {
        navigator.mediaDevices?.removeEventListener('devicechange', handleMediaListChange)
      })
    })

    void getMediaDevice(settingState.setting['player.mediaDeviceId']).then(async ({ deviceId, label }) =>
      setMediaDevice(deviceId, label)
    )
  })
}
