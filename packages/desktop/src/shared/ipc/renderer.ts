import { ipcRenderer } from 'electron'
import { RESPONSE_PREFIX } from './names'

type FuncsTools = typeof funcsTools
const funcsTools = {
  namespaceName: '',
  handlers: new Map<string, (event: Electron.IpcRendererEvent, key: string, ...params: unknown[]) => void>(),
  init(namespace: string, exposeObj: Record<string, (...args: unknown[]) => Promise<unknown>>) {
    this.namespaceName = namespace
    for (const [funcName, func] of Object.entries(exposeObj)) {
      const handler = async (event: Electron.IpcRendererEvent, key: string, ...params: unknown[]) => {
        let result: unknown
        try {
          result = await func(event, ...params)
        } catch (err) {
          ipcRenderer.send(`${namespace}${RESPONSE_PREFIX}`, key, {
            message: (err as Error).message,
            stack: (err as Error).stack,
          })
          return
        }
        ipcRenderer.send(`${namespace}${RESPONSE_PREFIX}`, key, null, result)
      }
      const name = this.createKey(funcName)
      this.handlers.set(name, handler)
      ipcRenderer.on(name, handler)
    }
  },
  createKey(funcName: string) {
    return `${this.namespaceName}_${funcName}`
  },
  async getData(funcName: string, args: unknown[]) {
    return ipcRenderer.invoke(this.createKey(funcName), ...args) as Promise<unknown>
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
    for (const [name, handler] of this.handlers.entries()) {
      ipcRenderer.off(name, handler)
    }
    this.handlers.clear()
  },
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMainCall = <T>(namespace: string, exposeObj: Record<string, (...args: any[]) => Promise<unknown>>) => {
  const tools = Object.create(funcsTools) as FuncsTools
  tools.init(namespace, exposeObj)

  return {
    remote: tools.createProxy<T>(tools),
    destroy: tools.destroy.bind(tools),
  }
}
