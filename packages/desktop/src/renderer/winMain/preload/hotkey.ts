import type { ClientCall, ExposeFunctions, MainCall } from '.'

// 暴露给后端的方法
export const createExposeHotkey = (client: ClientCall) => {
  return {
    async hotKeyEnabled(event, config) {
      return client.hotKeyEnabled(config)
    },
    async hotKeyConfigUpdated(event, config) {
      return client.hotKeyConfigUpdated(config)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientHotkey = (main: MainCall) => {
  return {
    async getHotKey() {
      return main.getHotKey()
    },
    async getHotkeyStatus() {
      return main.getHotkeyStatus()
    },
    async hotkeyConfigAction(action) {
      return main.hotkeyConfigAction(action)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
