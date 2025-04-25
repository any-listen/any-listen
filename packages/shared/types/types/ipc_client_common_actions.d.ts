// 可调用的客户端通用方法

export declare type ClientCommonActions = WarpPromiseRecord<{
  /** 深链接 */
  deeplink: (deeplink: string) => void
  /** 设置更新 */
  settingChanged: (keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) => void
  /** 快捷键触发（全局快捷键） */
  hotKeyDown: (config: AnyListen.HotKey.HotKeyDownInfo) => void
  /** 快捷键配置更新 */
  hotKeyConfigUpdated: <T extends string>(config: AnyListen.HotKey.HotKeyConfigAll<T>) => void
  /** 创建桌面歌词进程 */
  createDesktopLyricProcess: (ports: MessagePort[]) => void
  /** 显示消息弹窗 */
  showMessageBox: (extensionId: string, key: string, options: AnyListen.IPCCommon.MessageDialogOptions) => Promise<number>
  showInputBox: (extensionId: string, key: string, options: AnyListen.IPCCommon.InputDialogOptions) => Promise<string | undefined>
  showOpenBox: (
    extensionId: string,
    key: string,
    options: AnyListen.IPCCommon.OpenDialogOptions
  ) => Promise<string | string[] | undefined>
  showSaveBox: (extensionId: string, key: string, options: AnyListen.IPCCommon.SaveDialogOptions) => Promise<string | undefined>
  closeMessageBox: (key: string) => void
  updateInfo: (event: AnyListen.IPCCommon.UpdateInfo) => void
}>

declare global {
  namespace AnyListen {
    namespace IPCCommon {
      interface MessageButton {
        /** A short title like 'Retry', 'Open Log' etc. */
        text: string
        link?: string
      }
      interface MessageDialogOptions {
        type?: 'info' | 'warning' | 'error'
        title?: string
        textSelect?: boolean
        buttons?: MessageButton[]
        /** Human-readable detail message that is rendered less prominent. Note that detail is only shown for modal messages. */
        detail?: string
        /** Indicates that this message should be modal. */
        modal?: boolean
      }

      interface InputDialogOptions {
        /** Controls if a password input is shown. Password input hides the typed text. */
        password?: boolean
        /** An optional string to show as placeholder in the input box to guide the user what to type. */
        placeHolder?: string
        /** The text to display underneath the input box. */
        prompt?: string
        /** An optional string that represents the title of the input box. */
        title?: string
        /** The value to pre-fill in the input box. */
        value?: string
        /** An optional function that will be called to validate input and to give a hint to the user. */
        validateInput?: (value: string) => null | undefined | string
      }

      interface OpenDialogOptions {
        /** The resource the dialog shows when opened. */
        defaultPath?: string
        /** A human-readable string for the open button. */
        openLabel?: string
        /** Allow to select files, defaults to `true`. */
        canSelectFiles?: boolean
        /** Allow to select folders, defaults to `false`. */
        canSelectFolders?: boolean
        /** Allow to select many files or folders. */
        canSelectMany?: boolean
        /**
         *  A set of file filters that are used by the dialog. Each entry is a human-readable label,
         * like "TypeScript", and an array of extensions, for example:
         * ```ts
         * {
         *   'Images': ['png', 'jpg'],
         *   'TypeScript': ['ts', 'tsx']
         * }
         * ```
         */
        filters?: Record<string, string[]>
        /**
         * Dialog title.
         *
         * This parameter might be ignored, as not all operating systems display a title on open dialogs
         * (for example, macOS).
         */
        title?: string
      }

      interface SaveDialogOptions {
        /** The resource the dialog shows when opened. */
        defaultPath?: string
        /** A human-readable string for the save button. */
        saveLabel?: string
        /**
         * A set of file filters that are used by the dialog. Each entry is a human-readable label,
         * like "TypeScript", and an array of extensions, for example:
         * ```ts
         * {
         *   'Images': ['png', 'jpg'],
         *   'TypeScript': ['ts', 'tsx']
         * }
         * ```
         */
        filters?: Record<string, string[]>
        /**
         * Dialog title.
         *
         * This parameter might be ignored, as not all operating systems display a title on save dialogs
         * (for example, macOS).
         */
        title?: string
      }

      // 更新信息
      type UpdateInfo =
        | {
            type: 'checking'
          }
        | {
            type: 'available'
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
            info: AnyListen.UpdateInfo & {
              isAutoUpdate: boolean
              ignoreVersion: string | null
            }
          }
        | {
            type: 'not_available'
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
            info: AnyListen.UpdateInfo
          }
        | {
            type: 'error'
            message: string
          }
        | {
            type: 'download_progress'
            info: DownloadProgressInfo
          }
        | {
            type: 'downloaded'
          }
    }
  }
}
