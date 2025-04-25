// import { compareVer } from './index'

export default (setting: Record<string, unknown>): Partial<AnyListen.AppSetting> => {
  setting = { ...setting }

  return setting
}
