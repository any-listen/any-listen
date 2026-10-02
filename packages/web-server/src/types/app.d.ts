import type { Cache } from '@any-listen/common/cache'
import type Koa from 'koa'

declare global {
  namespace AnyListen {
    type RequestContext<ResponseBodyT = unknown> = Koa.ParameterizedContext<
      Koa.DefaultState,
      {
        userIp: string
        now: number
      },
      ResponseBodyT
    >
    type Next = Koa.Next
  }

  interface Anylisten {
    serverHost: string
    dataPath: string
    config: AnyListen.Config
    publicStaticPaths: Cache<string>
  }

  var anylisten: Anylisten
}
