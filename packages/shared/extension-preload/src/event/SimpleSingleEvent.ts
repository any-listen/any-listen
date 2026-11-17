export default class SingleEvent<Args extends any[] = unknown[]> {
  listeners: Array<(...args: Args) => unknown>
  constructor() {
    this.listeners = []
  }

  on(listener: (...args: Args) => unknown) {
    this.listeners.push(listener)
    return () => {
      this.off(listener)
    }
  }

  off(listener: (...args: Args) => unknown) {
    const index = this.listeners.indexOf(listener)
    if (index < 0) return
    this.listeners.splice(index, 1)
  }

  emit(...args: Args) {
    void Promise.resolve().then(() => {
      for (const listener of Array.from(this.listeners)) {
        listener(...args)
      }
    })
  }

  offAll() {
    this.listeners.length = 0
  }
}
