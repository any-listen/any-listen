declare namespace AnyListen {
  namespace IPCTheme {
    type ServerActions = WarpPromiseRecord<{
      /** 获取主题配置 */
      getThemeSetting: () => ThemeSetting
      /** 获取主题列表 */
      getThemeList: () => ThemeList
      /** 保存主题 */
      getThemeImages: () => ThemeImage[]
      saveThemeImage: (filePath: string) => ThemeImage
      removeThemeImage: (fileName: string) => void
      saveTheme: (theme: Theme) => void
      /** 移除主题 */
      removeTheme: (id: string) => void
    }>
    type ServerIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ServerActions>

    type ClientActions = WarpPromiseRecord<{
      /** 主题更新 */
      themeChanged: (setting: ThemeSetting) => void
      /** 主题列表更新 */
      themeListChanged: (list: ThemeList) => void
    }>
    type ClientIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ClientActions>
  }
}
