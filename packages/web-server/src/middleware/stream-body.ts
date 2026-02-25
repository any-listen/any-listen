import { ReadStream } from 'node:fs'

import { appLog } from '@/shared/log4js'

export default async (ctx: AnyListen.RequestContext, next: AnyListen.Next) => {
  await next()
  // https://github.com/koajs/koa/pull/1861
  // check if the object is a stream
  if (!(ctx.body instanceof ReadStream)) return

  await new Promise<void>((resolve, reject) => {
    // wait for it to be either readable or throw an error
    ;(ctx.body as ReadStream).once('readable', () => {
      resolve()
    })
    ;(ctx.body as ReadStream).once('error', (err) => {
      appLog.error(`Stream error[${ctx.path}]: `, err)
      reject(new Error(`Stream error: ${err.message}`))
    })
  })
}
