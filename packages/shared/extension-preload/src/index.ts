import { getAPI } from './apis/exposeAPI'
import { clear_interval, clear_timeout, set_interval, set_timeout } from './apis/global'
import { AbortController as _AbortController } from './event/AbortController'
import { freezeEnv } from './freezeEnv'
import { initHost } from './host'
import { handleHostCall, msg2call } from './preload'

globalThis.env_setup = (key, extension, env) => {
  delete globalThis.env_setup
  initHost(key, env, extension, msg2call.remote)
  const extensionAPI = getAPI()

  globalThis.require = (moduleName) => {
    if (typeof moduleName !== 'string') throw new Error('Module name requires a string')
    if ((moduleName as string) != 'any-listen') throw new Error(`Can't find the module: ${moduleName}`)

    return extensionAPI
  }
  globalThis.setTimeout = set_timeout
  globalThis.clearTimeout = clear_timeout
  globalThis.setInterval = set_interval
  globalThis.clearInterval = clear_interval
  globalThis.AbortController = _AbortController

  Object.defineProperty(globalThis, '__ext_preload__', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: handleHostCall,
  })

  freezeEnv()
}
