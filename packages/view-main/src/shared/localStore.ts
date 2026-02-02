export const LOCAL_STORE_KEYS = {
  windowInfo: 'window_info',
  updateDownloadFailedTip: 'update__download_failed_tip',
  updateCheckFailedTip: 'update__check_failed_tip',
} as const

type LocalStoreKey = (typeof LOCAL_STORE_KEYS)[keyof typeof LOCAL_STORE_KEYS]
export const getItem = (key: LocalStoreKey) => {
  return localStorage.getItem(key)
}

export const setItem = (key: LocalStoreKey, value: string) => {
  localStorage.setItem(key, value)
}
