export const nextTick = typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout

export default class SingleEvent<Args extends any[] = unknown[]> {
  listeners: Array<(...args: Args) => any>
  constructor() {
    this.listeners = []
  }

  on(listener: (...args: Args) => any) {
    this.listeners.push(listener)
    return () => {
      this.off(listener)
    }
  }

  once(listener: (...args: Args) => any) {
    const onceListener = (...args: Args) => {
      this.off(onceListener)
      listener(...args)
    }
    this.on(onceListener)
    return () => {
      this.off(onceListener)
    }
  }

  off(listener: (...args: Args) => any) {
    const index = this.listeners.indexOf(listener)
    if (index < 0) return
    this.listeners.splice(index, 1)
  }

  emit(...args: Args) {
    nextTick(() => {
      for (const listener of Array.from(this.listeners)) {
        listener(...args)
      }
    })
  }

  offAll() {
    this.listeners.length = 0
  }
}
