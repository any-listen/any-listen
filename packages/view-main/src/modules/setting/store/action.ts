import { setSetting } from '@/modules/app/store/action'
import { settingChangedEvent } from '@/shared/ipc/app/event'

import * as commit from './commit'

export const updateSetting = async (setting: Partial<AnyListen.AppSetting>) => {
  // console.warn(setting)
  await setSetting(setting)
}

export const registerRemoteSettingAction = () => {
  return settingChangedEvent.on((keys, setting) => {
    commit.updateSetting(keys, setting)
  })
}

export { getSetting } from '@/shared/ipc/app'
