import SingleEvent from '@any-listen/web/SimpleSingleEvent'

export const settingChangedEvent = new SingleEvent<
  [keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>]
>()

export const deeplinkEvent = new SingleEvent<[deeplink: string]>()

export const winShowEvent = new SingleEvent<[show: boolean]>()

export const updateInfoEvent = new SingleEvent<[info: AnyListen.IPCCommon.UpdateInfo]>()

export const closeMessageBoxEvent = new SingleEvent<[key: string]>()

export const createDesktopLyricProcessEvent = new SingleEvent<[posts: MessagePort[]]>()

export const appLogEvent = new SingleEvent<[type: AnyListen.LogType, log: string]>()
