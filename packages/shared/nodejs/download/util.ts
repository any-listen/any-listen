import { httpOverHttp, httpsOverHttp } from 'tunnel'

export const STATUS = {
  idle: 'IDLE',
  init: 'INIT',
  running: 'RUNNING',
  paused: 'PAUSED',
  stopped: 'STOPPED',
  completed: 'COMPLETED',
  error: 'ERROR',
  failed: 'FAILED',
} as const

export const getRequestAgent = (url: string, proxy?: { host: string; port: number }) => {
  let options
  if (proxy) {
    options = {
      proxy: {
        host: proxy.host,
        port: proxy.port,
      },
    }
  }
  return options ? (url.startsWith('https:') ? httpsOverHttp : httpOverHttp)(options) : undefined
}
