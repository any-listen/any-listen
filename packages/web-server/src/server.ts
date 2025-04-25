import Koa from 'koa'
import createCors from './middleware/cors'
import logHttp from './middleware/log-http'
import reqInit from './middleware/req-init'
import staticFile from './middleware/static-file'
import router from './modules'

export const createServerApp = (config: AnyListen.Config) => {
  const app = new Koa()

  app.use(reqInit)

  // http 日志
  if (config.httpLog) app.use(logHttp)

  // 跨域
  if (config['cors.enabled']) app.use(createCors())

  app.use(staticFile)

  // 路由
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
