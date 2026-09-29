export interface InitState {
  config: AnyListen.HotKey.HotKeyConfigAll
  isEditingHotKey: boolean
}

// const empty = {}
export const hotkeyState: InitState = {
  isEditingHotKey: false,
  config: {
    local: {
      enable: false,
      keys: {},
    },
    global: {
      enable: false,
      keys: {},
    },
  },
}
