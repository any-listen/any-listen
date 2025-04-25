import type { winMainEvent } from './event'

export { initWinMain } from './init'

export * as winMainActions from './actions'

export { winMainEvent } from './event'

export type WinMainEvent = typeof winMainEvent
