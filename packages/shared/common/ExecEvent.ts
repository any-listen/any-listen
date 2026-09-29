export default class ExecEvent {
  listeners: Map<string, (...args: unknown[]) => unknown>
  constructor() {
    this.listeners = new Map()
  }

  register(eventName: string, listener: (...args: unknown[]) => unknown) {
    if (this.listeners.has(eventName)) throw new Error(`Listener for event "${eventName}" already exists.`)
    this.listeners.set(eventName, listener)
    return () => {
      this.unregister(eventName)
    }
  }

  // once(eventName: string, listener: (...args: unknown[]) => unknown) {
  //   const onceListener = (...args: unknown[]) => {
  //     this.unregister(eventName)
  //     listener(...args)
  //   }
  //   this.register(eventName, onceListener)
  //   return () => {
  //     this.unregister(eventName)
  //   }
  // }

  unregister(eventName: string) {
    this.listeners.delete(eventName)
  }

  async execute(eventName: string, ...args: unknown[]) {
    const targetListener = this.listeners.get(eventName)
    if (!targetListener) throw new Error(`No listener for event "${eventName}"`)
    return targetListener(...args)
  }

  offAll() {
    this.listeners.clear()
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  z_(p: unknown) {}
}

// 添加一个参数为 unknown 的 z_ 方法解决 ts 生成 on / off 类型时的性能问题

type Gtype<E extends ExecEvent> = Omit<E, keyof ExecEvent | 'executeEvent'> & { z_: (p: unknown) => void }
export type EventType<E extends ExecEvent> = {
  register: <K extends keyof Gtype<E>>(event: K, listener: E[K]) => () => void
  unregister: <K extends keyof Gtype<E>>(event: K, listener: E[K]) => void
} & Omit<Gtype<E>, 'z_'>
