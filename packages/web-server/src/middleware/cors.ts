import cors from '@koa/cors'
import type Koa from 'koa'

export default () => {
  const whitelist = global.anylisten.config['cors.whitelist']
  const handle = whitelist.length
    ? (ctx: Koa.Context) => (ctx.header.origin && whitelist.includes(ctx.header.origin) ? ctx.header.origin : '')
    : (ctx: Koa.Context) => ctx.get('Origin')

  return cors({
    origin: handle,
    credentials: true,
    exposeHeaders: ['token'],
    maxAge: 86400,
  })
}
