import SingleEvent from '@any-listen/web/SimpleSingleEvent'

export const hotKeyEnabledEvent = new SingleEvent<[info: AnyListen.HotKey.Enable]>()

export const hotKeyConfigUpdatedEvent = new SingleEvent<[config: AnyListen.HotKey.Config]>()
