import SingleEvent from '@any-listen/web/SimpleSingleEvent'

export const desktopLyricInitedEvent = new SingleEvent<[ipc: AnyListen.IPCWinLyricActions.IPCWinLyricActions]>()
export const desktopLyricDestroyedEvent = new SingleEvent()
