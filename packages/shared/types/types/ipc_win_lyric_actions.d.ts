// 可调用的主窗口方法

declare namespace AnyListen {
  namespace IPCWinLyricActions {
    type IPCWinLyricActions = WarpPromiseRecord<{
      ping: () => void
      /** 设置更新 */
      settingChanged: (keys: Array<keyof AppSetting>, setting: Partial<AppSetting>) => void
      /** 主题更新 */
      themeChanged: (theme: ThemeSetting) => void

      playerEvent: (event: IPCPlayer.PlayerEvent) => void
    }>
  }
}
