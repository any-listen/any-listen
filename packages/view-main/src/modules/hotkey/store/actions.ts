import * as commit from './commit'
import { hotkeyConfigAction } from './remoteActions'
export { initConfig } from './commit'
export * from './remoteActions'

export const setEditing = async (editing: boolean) => {
  commit.setEditing(editing)
  if (import.meta.env.VITE_IS_DESKTOP) {
    await hotkeyConfigAction({
      action: 'tempDisable',
      data: editing,
    })
  }
}

export const saveConfig = async (type: 'local' | 'global', config: Record<string, string>) => {
  await hotkeyConfigAction({
    action: 'config',
    data: {
      type,
      config,
    },
  })
}

export const saveEnabled = async (type: 'local' | 'global', enable: boolean) => {
  await hotkeyConfigAction({
    action: 'enable',
    data: {
      type,
      enable,
    },
  })
}
