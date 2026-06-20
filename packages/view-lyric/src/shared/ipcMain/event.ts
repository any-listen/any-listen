import SingleEvent from '@any-listen/web/SimpleSingleEvent'

export const settingChangedEvent = new SingleEvent<
  [keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>]
>()

export const themeChangedEvent = new SingleEvent<[action: AnyListen.ThemeSetting]>()

export const playerEvent = new SingleEvent<[action: AnyListen.IPCPlayer.PlayerEvent]>()
