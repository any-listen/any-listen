import { ipcMain } from 'electron'
import { RESPONSE_PREFIX } from './names'
import { generateId } from '@any-listen/common/utils'

type GetDataHandleFn = (err: null | { message: string; stack?: string }, data?: unknown) => void
interface GetDataHandle extends GetDataHandleFn {
  timeout?: number | null
}
type FuncsTools = typeof funcsTools

const noop = (name: string, ...args: unknown[]) => {}
const funcsTools = {
  namespaceName: '',
  events: new Map<string, GetDataHandle>(),
  sendEvent: noop,
  handlers: new Set<string>(),
  init(
    namespace: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exposeObj: Record<string, (...args: any[]) => Promise<unknown>>,
    sendEvent: typeof noop
  ) {
    this.namespaceName = namespace
    this.sendEvent = sendEvent
    this.namespaceName = namespace

    for (const [funcName, func] of Object.entries(exposeObj)) {
      const name = this.createKey(funcName)
      this.handlers.add(name)
      ipcMain.handle(name, func)
    }
    ipcMain.on(
      `${namespace}${RESPONSE_PREFIX}`,
      (_event, id: string, err: null | { message: string; stack?: string }, data?: unknown) => {
        void this.handleResponse(id, err, data)
      }
    )
  },
  createKey(funcName: string) {
    return `${this.namespaceName}_${funcName}`
  },
  async handleData(funcName: string, args: unknown[]) {
    const id = generateId()
    return new Promise((resolve, reject) => {
      const handler = ((err: null | { message: string; stack?: string }, data?: unknown) => {
        this.events.delete(id)
        if (err == null) resolve(data)
        else {
          const error = new Error(err.message)
          error.stack = err.stack
          reject(error)
        }
      }) as GetDataHandle

      this.events.set(id, handler)
      this.sendEvent(this.createKey(funcName), id, ...args)
    })
  },
  async handleResponse(id: string, err: { message: string; stack?: string } | null, data?: unknown) {
    const handler = this.events.get(id)
    if (typeof handler == 'function') handler(err, data)
  },
  async getData(funcName: string, args: unknown[]) {
    return this.handleData(funcName, args)
  },
  createProxy<T>(context: typeof this, path?: string) {
    const proxy = new Proxy(() => {}, {
      get: (_target, prop, receiver): unknown => {
        let propName = prop.toString()
        // console.log('get prop name', propName, path)
        return context.createProxy(context, propName)
      },

      apply: async (target, thisArg, argumentsList) => {
        return context.getData(path!, argumentsList)
      },

      // deleteProperty
    }) as T

    return proxy
  },
  destroy() {
    for (const name of this.handlers.values()) {
      ipcMain.removeHandler(name)
    }
    this.handlers.clear()
  },
}
export const createRendererCall = <T>(
  namespace: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exposeTypeObj: Record<string, (...args: any[]) => Promise<unknown>>,
  sendEvent: typeof noop
) => {
  const tools = Object.create(funcsTools) as FuncsTools
  tools.init(namespace, exposeTypeObj, sendEvent)

  return {
    remote: tools.createProxy<T>(tools),
    destroy: tools.destroy.bind(tools),
  }
}
