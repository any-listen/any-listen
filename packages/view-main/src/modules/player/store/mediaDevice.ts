import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
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
    if (!navigator.mediaDevices as unknown as MediaDevices | undefined) {
      setHasMediaDevicePermission(false)
      throw new Error(location.protocol == 'http:' ? i18n.t('media_device.httpNotAllowed') : i18n.t('media_device.notAvailable'))
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    setHasMediaDevicePermission(true)
  } catch (err) {
    switch ((err as DOMException).name) {
      case 'TypeError':
      case 'NotAllowedError':
        setHasMediaDevicePermission(false)
        throw err
      default:
        setHasMediaDevicePermission(true)
        break
    }
  }
}
