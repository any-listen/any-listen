import { settingChangedEvent } from '@/shared/ipcMain/event'
import { ipc } from '@/shared/ipcMain/ipc'

import * as commit from './commit'

export const updateSetting = async (setting: Partial<AnyListen.AppSetting>) => {
  await ipc.setSetting(setting)
}

export const registerRemoteSettingAction = () => {
  return settingChangedEvent.on((keys, setting) => {
    commit.updateSetting(keys, setting)
  })
}

export const getSetting = async () => {
  return ipc.getSetting()
}
