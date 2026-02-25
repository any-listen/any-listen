import { STORE_NAMES } from '@any-listen/common/constants'

import defaultSetting from '@/app/shared/defaultSetting'
import getStore from '@/app/shared/store'

import { migrateSetting } from './config/migrateSetting'
import { appState } from './state'

const primitiveType = ['string', 'boolean', 'number']
const checkPrimitiveType = (val: unknown): boolean => val === null || primitiveType.includes(typeof val)
export const mergeSetting = (
  originSetting: AnyListen.AppSetting,
  targetSetting?: Partial<AnyListen.AppSetting> | null
): {
  setting: AnyListen.AppSetting
  updatedSettingKeys: Array<keyof AnyListen.AppSetting>
  updatedSetting: Partial<AnyListen.AppSetting>
} => {
  let originSettingCopy: AnyListen.AppSetting = { ...originSetting }
  // const defaultVersion = targetSettingCopy.version
  const updatedSettingKeys: Array<keyof AnyListen.AppSetting> = []
  const updatedSetting: Partial<AnyListen.AppSetting> = {}

  if (targetSetting) {
    const originSettingKeys = Object.keys(originSettingCopy)
    const targetSettingKeys = Object.keys(targetSetting)

    if (originSettingKeys.length > targetSettingKeys.length) {
      for (const key of targetSettingKeys as Array<keyof AnyListen.AppSetting>) {
        const targetValue: unknown = targetSetting[key]
        const isPrimitive = checkPrimitiveType(targetValue)
        // if (checkPrimitiveType(value)) {
        if (!isPrimitive || targetValue == originSettingCopy[key] || (originSettingCopy[key] as unknown) === undefined) continue
        updatedSettingKeys.push(key)
        // @ts-expect-error
        updatedSetting[key] = targetValue
        // @ts-expect-error
        originSettingCopy[key] = targetValue
        // } else {
        //   if (!isPrimitive && currentValue != undefined) handleMergeSetting(value, currentValue)
        // }
      }
    } else {
      for (const key of originSettingKeys as Array<keyof AnyListen.AppSetting>) {
        const targetValue: unknown = targetSetting[key]
        const isPrimitive = checkPrimitiveType(targetValue)
        // if (checkPrimitiveType(value)) {
        if (!isPrimitive || targetValue == originSettingCopy[key]) continue
        updatedSettingKeys.push(key)
        // @ts-expect-error
        updatedSetting[key] = targetValue
        // @ts-expect-error
        originSettingCopy[key] = targetValue
        // } else {
        //   if (!isPrimitive && currentValue != undefined) handleMergeSetting(value, currentValue)
        // }
      }
    }
  }

  return {
    setting: originSettingCopy,
    updatedSettingKeys,
    updatedSetting,
  }
}

export const saveSetting = (setting?: Partial<AnyListen.AppSetting>, isInit = false) => {
  const storeConfig = getStore(STORE_NAMES.APP_SETTINGS)

  let originSetting: AnyListen.AppSetting
  if (isInit) {
    setting &&= migrateSetting(setting)
    originSetting = { ...defaultSetting }
  } else originSetting = appState.appSetting

  const result = mergeSetting(originSetting, setting)

  result.setting.version = defaultSetting.version

  storeConfig.override({ version: result.setting.version, setting: result.setting })
  return result
}

/**
 * 初始化设置
 */
export const getAppSetting = async () => {
  const storeConfig = getStore(STORE_NAMES.APP_SETTINGS)

  let setting = storeConfig.get('setting') as AnyListen.AppSetting | undefined

  // migrate setting

  // console.log(setting)
  return saveSetting(setting, true)
}
