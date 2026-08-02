import http from 'node:http'

import { logs } from '@any-listen/app/modules/logs'
import { initProxyServer as initProxyServerState, proxyRequest } from '@any-listen/app/modules/proxyServer'
import { PROXY_SERVER_PATH } from '@any-listen/common/constants'

import { appState } from '@/app'

let DEFAULT_PORT = 19500
let retryCount = 0
const PROXY_PATH_PREFIX = `${PROXY_SERVER_PATH}/`
const createProxyServer = async () => {
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Bad Request\n')
        return
      }
      const path = req.url.split('?')[0]
      if (path.startsWith(PROXY_PATH_PREFIX)) {
        const name = decodeURIComponent(path.replace(PROXY_PATH_PREFIX, ''))
        const result = await proxyRequest(name, req.headers)
        if (result) {
          for (const [key, value] of Object.entries(result.headers)) {
            if (!value) continue
            try {
              res.setHeader(key, value)
            } catch (e) {
              logs.ProxyService.logcat.warn(`invalid header: ${key}`, value, e)
            }
          }
          res.statusCode = result.statusCode
          if (result.body) {
            result.body.pipe(res)

            // 当客户端断开时，销毁所有流
            const cleanup = () => {
              if (result.body!.destroyed) return
              result.body!.destroy() // 中止上游请求
              res.removeListener('close', cleanup)
              req.removeListener('close', cleanup)
            }
            res.once('close', cleanup)
            req.once('close', cleanup)
          } else {
            res.end()
          }
          return
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found\n')
        return
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('AnyListen Proxy Server\n')
    } catch (err) {
      logs.ProxyService.logcat.error(`proxyRequest error, path: ${req.url}, headers: ${JSON.stringify(req.headers)}`, err)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error\n')
    }
  })
  server.listen(DEFAULT_PORT, 'localhost')
  return new Promise<string>((resolve, reject) => {
    server.on('listening', () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        const host = address.family == 'IPv6' ? `[${address.address}]` : address.address
        resolve(`http://${host}:${address.port}`)
      } else {
        reject(new Error('Failed to get server address'))
      }
    })
    server.on('error', (err) => {
      reject(err)
    })
  })
}

export const initProxyServer = async () => {
  const proxyHost = await createProxyServer().catch(async (err) => {
    console.error(`Failed to start proxy server on ${DEFAULT_PORT} port`, err)
    DEFAULT_PORT++
    retryCount++
    if (retryCount > 10) {
      logs.ProxyService.logcat.error(`Failed to start proxy server after 10 retries`, err)
      throw new Error('Failed to start proxy server after 10 retries')
    }
    return createProxyServer()
  })
  console.log('Proxy server running at', proxyHost)
  void initProxyServerState(proxyHost, PROXY_SERVER_PATH, appState.cacheDataPath)
}
