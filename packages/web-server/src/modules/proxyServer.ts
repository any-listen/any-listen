import { proxyRequest, proxyRequestByUrl, getProxyUrlKey } from '@any-listen/app/modules/proxyServer'
import { PROXY_SERVER_PATH, PROXY_URL_PATH, PROXY_URL_KEY_COOKIE_NAME } from '@any-listen/common/constants'
import type Router from '@koa/router'

import { authConnect } from './ipc/auth'

export const registerProxyRouter = (router: Router<unknown, AnyListen.RequestContext>) => {
  router.get(`${PROXY_SERVER_PATH}/:name`, async (ctx, next) => {
    const result = await proxyRequest(ctx.params.name, ctx.headers)
    if (!result) {
      ctx.status = 404
      ctx.body = 'Not Found'
      return
    }
    ctx.status = result.statusCode
    for (const [k, v] of Object.entries(result.headers)) {
      ctx.set(k, v)
    }
    ctx.body = result.body
  })
  router.get('/proxyUrlToken', async (ctx, next) => {
    const keyInfo = await authConnect(ctx.req).catch(() => null)
    if (!keyInfo) {
      ctx.status = 401
      ctx.body = 'Unauthorized'
      return
    }
    ctx.cookies.set(PROXY_URL_KEY_COOKIE_NAME, await getProxyUrlKey(), {
      httpOnly: true,
      sameSite: 'strict',
      // maxAge: 36500 * 24 * 3600 * 1000,
      maxAge: 0,
    })
    ctx.status = 200
    ctx.body = 'OK'
  })
  router.get(`${PROXY_URL_PATH}/:url`, async (ctx, next) => {
    if (import.meta.env.PROD) {
      if (ctx.cookies.get(PROXY_URL_KEY_COOKIE_NAME) !== (await getProxyUrlKey())) {
        ctx.status = 403
        ctx.body = 'Forbidden'
        return
      }
    }
    const result = await proxyRequestByUrl(ctx.params.url, ctx.headers)
    if (!result) {
      ctx.status = 404
      ctx.body = 'Not Found'
      return
    }
    ctx.status = result.statusCode
    for (const [k, v] of Object.entries(result.headers)) {
      ctx.set(k, v)
    }
    ctx.body = result.body
  })
}
