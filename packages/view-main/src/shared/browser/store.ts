export const LOCAL_STORE_KEYS = {
  mediaDeviceId: 'media_device_id',
} as const

type LocalStoreKey = (typeof LOCAL_STORE_KEYS)[keyof typeof LOCAL_STORE_KEYS]
export const getItem = (key: LocalStoreKey) => {
  return localStorage.getItem(key)
}

export const setItem = (key: LocalStoreKey, value: string) => {
  localStorage.setItem(key, value)
}
