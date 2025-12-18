import { createCache } from '@any-listen/common/cache'
import type { Options } from '@any-listen/nodejs/request'
import type { WriteStream } from 'node:fs'

export const proxyServerState = {
  proxyBaseUrl: '',
  cacheDir: '',
  proxyMap: createCache<{
    requestOptions: Options
    url: string
    enabledCache?: boolean
  }>({
    max: 1000,
    ttl: 1000 * 60 * 60 * 6,
  }),
  activeWriteStreams: new Map<string, WriteStream>(),
}
