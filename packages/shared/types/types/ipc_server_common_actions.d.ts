// 可调用的服务端通用方法

export declare type ServerCommonActions = WarpPromiseRecord<{
  /** UI 初始完成 */
  inited: () => void
  /** 最小化窗口 */
  minWindow: () => void
  /** 关闭窗口 */
  closeWindow: (isForce?: boolean) => void

  showOpenDialog: (options: AnyListen.OpenDialogOptions) => Promise<AnyListen.OpenDialogResult>
  showSaveDialog: (options: AnyListen.SaveDialogOptions) => Promise<AnyListen.SaveDialogResult>
  openDirInExplorer: (path: string) => void
  clipboardReadText: () => string
  clipboardWriteText: (text: string) => void
  openDevTools: () => void
  openUrl: (url: string) => void

  /** 获取机器ID */
  getMachineId: () => string
  /** 获取配置 */
  getSetting: () => AnyListen.AppSetting
  /** 更新配置 */
  setSetting: (setting: Partial<AnyListen.AppSetting>) => void

  /** 获取快捷键配置 */
  getHotKey: <T extends string>() => AnyListen.HotKey.HotKeyConfigAll<T>
  /** 获取快捷键状态（是否占用） */
  getHotkeyStatus: <T extends string>() => AnyListen.HotKey.HotKeyState<T>
  /** 快捷键配置更新操作 */
  hotkeyConfigAction: <T extends string>(action: AnyListen.HotKey.HotKeyActions<T>) => boolean

  /** 获取 web 登录的设备 */
  getLoginDevices: () => Promise<{ list: AnyListen.LoginDevice[]; currentId: string }>
  /** 移除 web 登录设备 */
  removeLoginDevice: (id: string) => void

  /** 获取上一次启动的版本号 */
  getLastStartInfo: () => AnyListen.LastStartInfo | null
  /** 保存上一次启动的版本号 */
  saveLastStartInfo: () => void
  /** 获取上一次选中的列表id */
  getListPrevSelectId: () => string | null
  /** 保存上一次选中的列表id */
  saveListPrevSelectId: (id: string) => void
  /** 获取搜索历史列表 */
  getSearchHistoryList: () => AnyListen.List.SearchHistoryList | null
  /** 保存搜索历史列表 */
  saveSearchHistoryList: (list: AnyListen.List.SearchHistoryList) => void
  saveIgnoreVersion: (ver: string | null) => void

  /** 文件系统操作 */
  fileSystemAction: <T extends keyof AnyListen.FileSystem.Actions>(
    action: AnyListen.FileSystem.Actions[T][0]
  ) => Promise<AnyListen.FileSystem.Actions[T][1]>

  /** 获取当前版本信息 */
  getCurrentVersionInfo: () => AnyListen.CurrentVersionInfo
  /** 检查软件更新 */
  checkUpdate: () => boolean
  /** 下载更新 */
  downloadUpdate: () => void
  /** 重启更新 */
  restartUpdate: () => void
  /** 获取系统字体列表 */
  getSystemFonts: () => string[]
  /** 获取缓存大小 */
  getCacheSize: () => number
  /** 清理缓存 */
  clearCache: () => void
}>
