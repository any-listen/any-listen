// import { registerDevRouter } from './dev'
import { API_PREFIX } from '@any-listen/common/constants'
import Router from '@koa/router'

import { registerIpcRouter } from './ipc'
import { registerProxyRouter } from './proxyServer'

const router = new Router<unknown, AnyListen.RequestContext>()

router.prefix(API_PREFIX)

// if (import.meta.env.DEV) registerDevRouter(router)

registerIpcRouter(router)
registerProxyRouter(router)

export default router
