import { hotkeyEvent } from './event'
import { hotkeyState } from './state'

export const initConfig = (config: AnyListen.HotKey.HotKeyConfigAll) => {
  hotkeyState.config.global = config.global
  hotkeyState.config.local = config.local
  hotkeyEvent.configInit(config)
  console.log(config)
}

export const updateConfig = (config: AnyListen.HotKey.Config) => {
  hotkeyState.config[config.type].keys = config.config
  hotkeyEvent.configUpdated(config)
}

export const updateEnabled = (config: AnyListen.HotKey.Enable) => {
  hotkeyState.config[config.type].enable = config.enable
  hotkeyEvent.enableUpdated(config)
}

export const setEditing = (editing: boolean) => {
  hotkeyState.isEditingHotKey = editing
}
