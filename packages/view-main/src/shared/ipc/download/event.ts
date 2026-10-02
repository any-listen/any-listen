import SingleEvent from '@any-listen/web/SimpleSingleEvent'

export const downloadListActionEvent = new SingleEvent<[action: AnyListen.Download.ListAction]>()
