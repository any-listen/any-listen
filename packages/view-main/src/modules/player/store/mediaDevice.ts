import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { getItem, setItem } from '@/shared/browser/store'

import { playerEvent } from './event'

export const getMediaDeviceIdSetting = () => {
  if (import.meta.env.VITE_IS_WEB) {
    return getItem('media_device_id') ?? 'default'
  }
  return settingState.setting['player.mediaDeviceId']
}
export const saveMediaDeviceIdSetting = async (id: string) => {
  if (getMediaDeviceIdSetting() == id) return
  if (import.meta.env.VITE_IS_WEB) {
    setItem('media_device_id', id)
    playerEvent.mediaDeviceChanged(id)
    return
  }
  await updateSetting({ 'player.mediaDeviceId': id })
}

let hasDevicePermission = false
export const setHasMediaDevicePermission = (permission: boolean) => {
  hasDevicePermission = permission
}
export const getHasMediaDevicePermission = () => {
  return hasDevicePermission
}

export const getMediaDevices = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rawDevices = (navigator.mediaDevices ? await navigator.mediaDevices.enumerateDevices() : []).filter(
    ({ kind }) => kind == 'audiooutput'
  )
  if (import.meta.env.VITE_IS_WEB) {
    // console.log(rawDevices)
    setHasMediaDevicePermission(rawDevices.some((d) => d.label && d.deviceId))
  }
  const devices = rawDevices.map((d) => {
    return {
      deviceId: d.deviceId || 'default',
      label: d.label || 'Default',
    }
  })
  if (!devices.length) devices.push({ deviceId: 'default', label: 'Default' })
  return devices
}

export const requestMediaDevicePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    setHasMediaDevicePermission(true)
  } catch (err) {
    console.log('requestMediaDevicePermission error', err)
    if ((err as DOMException).name === 'NotAllowedError') {
      setHasMediaDevicePermission(false)
    } else {
      setHasMediaDevicePermission(true)
    }
  }
  return hasDevicePermission
}
