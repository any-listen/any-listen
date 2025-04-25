import { rendererIPC } from '@/renderer/winMain/rendererEvent'

export const boxTools = {
  datas: new Map<string, [() => Promise<unknown>, (result: unknown) => void, (error: Error) => void]>(),
  queue: [] as string[],
  promise: Promise.resolve(),
  currentKey: null as null | string,
  async showBox<T>(key: string, run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(key)
      this.datas.set(key, [run, resolve as (result: unknown) => void, reject])
      this.next()
    })
  },
  closeBox(key: string, message?: string) {
    if (!this.datas.has(key)) return
    const [, , reject] = this.datas.get(key)!
    if (this.currentKey == key) {
      void rendererIPC.closeMessageBox(key)
      reject(new Error(message ?? 'canceled'))
      this.queue.splice(this.queue.indexOf(key), 1)
      this.datas.delete(key)
      this.currentKey = null
      this.next()
    } else {
      reject(new Error(message ?? 'canceled'))
      this.datas.delete(key)
      this.queue.splice(this.queue.indexOf(key), 1)
    }
  },
  next() {
    if (this.currentKey) return
    void this.promise.finally(() => {
      if (!this.queue.length) return
      const key = this.queue[0]
      this.currentKey = key
      const [run, resolve, reject] = this.datas.get(key)!
      void run()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          if (this.currentKey != key) return
          this.queue.splice(this.queue.indexOf(key), 1)
          this.datas.delete(key)
          this.currentKey = null
          this.next()
        })
    })
  },
}
