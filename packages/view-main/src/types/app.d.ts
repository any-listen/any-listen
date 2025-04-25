// import { type I18n } from '@/plugins/i18n'
// interface AnyListen.EnvParams {
//   deeplink?: string | null
//   cmdParams: AnyListen.CmdParams
//   workAreaSize?: Electron.Size
// }

// interface AnyListen {
//   // appSetting: AnyListen.AppSetting
//   isEditingHotKey: boolean
//   isPlayedStop: boolean
//   appHotKeyConfig: AnyListen.HotKeyConfigAll
//   restorePlayInfo: AnyListen.Player.SavedPlayInfo | null
//   isProd: boolean
//   songListInfo: {
//     fromName: string
//     searchKey: string | null
//     searchPosition?: number
//     songlistKey: string | null
//     songlistPosition?: number
//   }
//   rootOffset: number
// }

declare interface Window {
  // ELECTRON_DISABLE_SECURITY_WARNINGS?: string
  dt: boolean
  os: 'windows' | 'linux' | 'mac'
  // shouldUseDarkColors: boolean
  // anylisten: AnyListen
  // app_event: AppEventTypes
  // key_event: KeyEventTypes
  // i18n: I18n

  testData: any

  __anylisten_ipc_init__?: AnyListen.IPC.ConnectIPCSrivice

  setTheme: (colors: Record<string, string>) => void
  setLang: (lang?: string) => void
}

// const ENVIRONMENT: NodeJS.ProcessEnv

declare namespace AnyListen {
  interface KeyDownEevent {
    /**
     * 原始事件
     */
    event: KeyboardEvent | null

    /**
     * 按下的按键数组
     */
    keys: string[]

    /**
     * 按下的按键组合
     *
     * 类似：`shift`、`mod+a`
     *
     * 其中 `Ctrl` 的名称为 `mod`， 对应 MacOS 上的 `Command` 键
     */
    key: string
    /**
     * 当前触发此事件的单个按键（不包括之前已按下的键）
     */
    eventKey: KeyboardEvent['key']
    /**
     * 按键操作类型
     */
    type: 'down' | 'up'
    /**
     * 是否处于输入状态
     */
    inputing: boolean
  }

  type LyricFormat = 'gbk' | 'utf8'
}

// declare const ELECTRON_DISABLE_SECURITY_WARNINGS: string
// declare const userApiPath: string
// declare const IS_WEB: boolean
