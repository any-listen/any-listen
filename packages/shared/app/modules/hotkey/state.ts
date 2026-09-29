export const hotKeyState: {
  config: AnyListen.HotKey.HotKeyConfigAll
  state: AnyListen.HotKey.HotKeyState
} = {
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
  state: new Map(),
}
