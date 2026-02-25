import { IPC_CODE } from '@any-listen/common/constants'
import type Router from '@koa/router'

import { getLoginPassword, getServerId } from '@/shared/data'

import { authCode } from './auth'

export const registerIpcRouter = (router: Router<unknown, AnyListen.RequestContext>) => {
  router.get('/ipc/hello', async (ctx, next) => {
    ctx.body = IPC_CODE.helloMsg
  })
  router.get('/ipc/id', async (ctx, next) => {
    ctx.body = IPC_CODE.idPrefix + getServerId()
  })
  router.post('/ipc/ah', async (ctx, next) => {
    await authCode(ctx, getLoginPassword())
  })
}
