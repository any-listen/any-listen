/* eslint-disable @typescript-eslint/naming-convention */
import { hostContext } from '@/host/state'

import { logcat } from './logcat'

enum TIMEOUT_TYPE {
  TIMEOUT,
  INTERVAL,
}
// prettier-ignore
const timeouts = new Map<number, {
  callback: (...args: unknown[]) => void
  args: unknown[]
  type: TIMEOUT_TYPE
}>()
let timeoutId = 0

const createTimeout = <TArgs extends unknown[]>(
  type: TIMEOUT_TYPE,
  callback: (...args: TArgs) => void,
  ms: number,
  args: TArgs
) => {
  if (typeof callback !== 'function') throw new Error('callback required a function')
  if (typeof ms !== 'number') throw new Error('timeout required a number')
  if (timeoutId > 90000000000) throw new Error('max timeout')
  const id = timeoutId++
  timeouts.set(id, {
    // @ts-expect-error
    callback(...args: TArgs) {
      callback(...args)
    },
    args,
    type,
  })
  return id
}
export const set_timeout = <TArgs extends unknown[]>(callback: (...args: TArgs) => void, ms = 0, ...args: TArgs) => {
  ms = Math.max(ms, 0)
  const id = createTimeout(TIMEOUT_TYPE.TIMEOUT, callback, ms, args)
  hostContext.set_timeout(id, ms)
  return id
}

export const clear_timeout = (id: number) => {
  const tagret = timeouts.get(id)
  if (!tagret) return
  timeouts.delete(id)
  hostContext.clear_timeout(id)
}

export const set_interval = <TArgs extends unknown[]>(callback: (...args: TArgs) => void, ms = 0, ...args: TArgs) => {
  ms = Math.max(ms, 0)
  const id = createTimeout(TIMEOUT_TYPE.INTERVAL, callback, ms, args)
  hostContext.set_interval(id, ms)
  return id
}

export const clear_interval = (id: number) => {
  const tagret = timeouts.get(id)
  if (!tagret) return
  timeouts.delete(id)
  hostContext.clear_interval(id)
}

export const triggerTimeout = (id: number) => {
  const tagret = timeouts.get(id)
  if (!tagret) return
  tagret.callback(...tagret.args)
  if (tagret.type == TIMEOUT_TYPE.TIMEOUT) timeouts.delete(id)
}

export const console = {
  log(...args: unknown[]) {
    logcat.info(...args)
  },
  debug(...args: unknown[]) {
    logcat.debug(...args)
  },
  info(...args: unknown[]) {
    logcat.info(...args)
  },
  warn(...args: unknown[]) {
    logcat.warn(...args)
  },
  error(...args: unknown[]) {
    logcat.error(...args)
  },
}
