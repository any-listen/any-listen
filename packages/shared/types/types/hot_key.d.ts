declare namespace AnyListen {
  namespace HotKey {
    interface HotKeyConfig {
      enable: boolean
      keys: Record<string, string>
    }
    interface HotKeyConfigAll {
      local: HotKeyConfig
      global: HotKeyConfig
    }
    interface Config {
      type: 'local' | 'global'
      config: HotKeyConfig['keys']
    }
    interface Enable {
      enable: boolean
      type: 'local' | 'global'
    }
    type HotKeyState = Map<string, boolean>
    interface HotKeyActionWrap<T, D> {
      action: T
      data: D
    }
    type HotKeyActions =
      | HotKeyActionWrap<'config', Config>
      | HotKeyActionWrap<'enable', Enable>
      | HotKeyActionWrap<'tempDisable', boolean>
  }
}
