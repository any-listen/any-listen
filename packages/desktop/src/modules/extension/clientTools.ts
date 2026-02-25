import { extensionEvent } from '@any-listen/app/modules/extension'
import { CANCELED_ERROR_MSG } from '@any-listen/common/constants'

import { rendererIPC } from '@/renderer/winMain/rendererEvent'

export const boxTools = {
  datas: new Map<string, [string, () => Promise<unknown>, (result: unknown) => void, (error: Error) => void]>(),
  queue: [] as string[],
  promise: Promise.resolve(),
  inited: false,
  currentKey: null as null | string,
  currentExtensionId: null as null | string,
  init() {
    if (this.inited) return
    this.inited = true
    extensionEvent.on('extensionEvent', (event) => {
      if (event.action !== 'stoping') return
      if (this.currentExtensionId === event.data && this.currentKey) {
        this.closeBox(this.currentKey, 'Extension is stopping')
        return
      }
      for (const [key, [extId]] of this.datas.entries()) {
        if (extId !== event.data) continue
        this.closeBox(key, 'Extension is stopping')
      }
    })
  },
  async showBox<T>(key: string, extId: string, run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(key)
      this.datas.set(key, [extId, run, resolve as (result: unknown) => void, reject])
      this.next()
    })
  },
  closeBox(key: string, message?: string) {
    if (!this.datas.has(key)) return
    const [, , reject] = this.datas.get(key)!
    if (this.currentKey == key) {
      void rendererIPC.closeMessageBox(key)
      reject(new Error(message ?? CANCELED_ERROR_MSG))
      this.queue.splice(this.queue.indexOf(key), 1)
      this.datas.delete(key)
      this.currentKey = null
      this.currentExtensionId = null
      this.next()
    } else {
      reject(new Error(message ?? CANCELED_ERROR_MSG))
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
      const [extId, run, resolve, reject] = this.datas.get(key)!
      this.currentExtensionId = extId
      void run()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          if (this.currentKey != key) return
          this.queue.splice(this.queue.indexOf(key), 1)
          this.datas.delete(key)
          this.currentKey = null
          this.currentExtensionId = null
          this.next()
        })
    })
  },
}
