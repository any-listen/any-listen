let _getSettings: <T extends keyof AnyListen.AppSetting>(key: T) => Promise<AnyListen.AppSetting[T]>
export const setGetSettings = (func: <T extends keyof AnyListen.AppSetting>(key: T) => Promise<AnyListen.AppSetting[T]>) => {
  _getSettings = func
}

export const getSettings = async <T extends keyof AnyListen.AppSetting>(key: T) => {
  return _getSettings(key)
}
