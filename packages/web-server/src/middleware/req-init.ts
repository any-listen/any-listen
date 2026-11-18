export default () => {
  const proxyHeaderKey = global.anylisten.config['upstreamProxy.enabled'] && global.anylisten.config['upstreamProxy.header']

  return async (ctx: AnyListen.RequestContext, next: AnyListen.Next): Promise<unknown> => {
    let ip = ctx.ip
    if (proxyHeaderKey) {
      const proxyIp = ctx.headers[proxyHeaderKey]
      // only the rightmost entry is set by the trusted upstream, anything to its left is client controlled
      if (typeof proxyIp == 'string' && proxyIp) ip = proxyIp.split(',').pop()!.trim()
    }
    ctx.userIp = ip
    ctx.now = Date.now()
    return next()
  }
}
