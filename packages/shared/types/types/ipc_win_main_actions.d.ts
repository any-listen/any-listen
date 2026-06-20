// 可调用的主窗口方法

declare namespace AnyListen {
  namespace IPCWinMainActions {
    type IPCWinMainActions = WarpPromiseRecord<{
      /** 获取配置 */
      getSetting: () => AppSetting
      /** 更新配置 */
      setSetting: (setting: Partial<AppSetting>) => void
      /** 获取主题配置 */
      getThemeSetting: () => ThemeSetting

      /** 获取播放器当前时间 */
      getPlayerCurrentTime: () => number

      getPlayerInfo: () => {
        musicInfo: Player.MusicInfo
        progress: IPCPlayer.Progress
        playerPlaying: boolean
        playing: boolean
        statusText: string
        playbackRate: number
        loadErrorPicUrl: string
      }

      playerAction: (action: IPCPlayer.ActionPlayer) => void
    }>
  }
}
