import { extensionEvent } from '@any-listen/app/modules/extension'
import { CANCELED_ERROR_MSG } from '@any-listen/common/constants'

import { appEvent } from '@/app/app'
import { rendererIPC } from '@/app/renderer/winMain/rendererEvent'
import { getSockets, type ServerSocketWinMain } from '@/modules/ipc/websocket'

export const getConnectedClients = () => {
  return getSockets().filter((s) => s.isInited)
}

const cancelError = Symbol(CANCELED_ERROR_MSG)
const wrapCall = async (promise: Promise<unknown>) => {
  return promise.catch((err: Error) => {
    if (err.message === CANCELED_ERROR_MSG) return cancelError
    throw err
  })
}

export const connectTools = {
  inited: false,
  promise: null as null | Promise<unknown>,
  promiseFn: [() => {}, () => {}] as [(result: unknown) => void, (error: Error) => void],
  callback: null as null | ((socket: ServerSocketWinMain) => Promise<unknown>),
  init() {
    if (this.inited) return
    this.inited = true
    appEvent.on('clientConnected', (socket) => {
      if (this.callback) {
        this.promise = this.promise
          ? Promise.any([this.promise, wrapCall(this.callback(socket))])
          : wrapCall(this.callback(socket))
        void this.promise.then((result) => {
          if (result === cancelError) {
            this.promiseFn[1](new Error(CANCELED_ERROR_MSG))
          } else {
            this.promiseFn[0](result)
          }
          this.callback = null
          this.promiseFn = [() => {}, () => {}]
        })
      }
    })
  },
  async run<T>(callback: (socket: ServerSocketWinMain) => Promise<T>): Promise<T> {
    this.init()
    this.callback = callback
    return new Promise<T>((resolve, reject) => {
      this.promiseFn = [resolve as () => void, reject]
      const connectSockets = getConnectedClients()
      if (connectSockets.length) {
        this.promise = Promise.any(Array.from(connectSockets).map(async (socket) => wrapCall(callback(socket))))
        void this.promise.then((result) => {
          if (result === cancelError) {
            reject(new Error(CANCELED_ERROR_MSG))
          } else {
            resolve(result as T)
          }
          this.callback = null
          this.promiseFn = [() => {}, () => {}]
        })
      }
    }).finally(() => {
      this.promise = null
    })
  },
  stop(run: (socket: ServerSocketWinMain) => void, message?: string) {
    if (!this.callback) return
    this.callback = null
    this.promiseFn[1](new Error(message ?? CANCELED_ERROR_MSG))
    for (const socket of getConnectedClients()) {
      if (socket.isReady) run(socket)
    }
  },
}
export const boxTools = {
  datas: new Map<
    string,
    [string, (socket: ServerSocketWinMain) => Promise<unknown>, (result: unknown) => void, (error: Error) => void]
  >(),
  queue: [] as string[],
  // promise: Promise.resolve(),
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
  async showBox<T>(key: string, extId: string, sync: boolean, run: (socket: ServerSocketWinMain) => Promise<T>): Promise<T> {
    this.init()
    // TODO async message box
    return new Promise<T>((resolve, reject) => {
      this.queue.push(key)
      this.datas.set(key, [extId, run, resolve as (result: unknown) => void, reject])
      this.next()
    }).finally(() => {
      void rendererIPC.closeMessageBox(key)
    })
  },
  closeBox(key: string, message?: string) {
    if (!this.datas.has(key)) return
    const [, , reject] = this.datas.get(key)!
    if (this.currentKey == key) {
      connectTools.stop((socket) => {}, message)
      void rendererIPC.closeMessageBox(key)
    } else {
      reject(new Error(message ?? CANCELED_ERROR_MSG))
      this.datas.delete(key)
      this.queue.splice(this.queue.indexOf(key), 1)
    }
  },
  next() {
    if (this.currentKey) return
    // void this.promise.finally(() => {
    if (!this.queue.length) return
    const key = this.queue[0]
    this.currentKey = key
    const [extId, run, resolve, reject] = this.datas.get(key)!
    this.currentExtensionId = extId
    void connectTools
      .run(run)
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
    // })
  },
}
