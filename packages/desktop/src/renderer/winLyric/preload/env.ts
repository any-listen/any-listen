import timers from 'node:timers'

const nodeTimeout = (callback: () => void, delay?: number) => {
  return timers.setTimeout(callback, delay) as unknown as number
}

const nodeClearTimeout = (id: number) => {
  timers.clearTimeout(id)
}

const env = Object.freeze<AnyListen.IPC.NodeEnv>({
  setTimeout: nodeTimeout,
  clearTimeout: nodeClearTimeout,
})

// @ts-expect-error
Object.defineProperty(window, '__anylisten_node_env__', {
  value: env,
  configurable: false,
  enumerable: false,
  writable: false,
})
