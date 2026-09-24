import { deflate, inflate, gzip, gunzip, constants } from 'node:zlib'

const FLUSH_OPTIONS = ['Z_FINISH', 'Z_SYNC_FLUSH'] as const
const FINISH_FLUSH_MAP = {
  Z_FINISH: constants.Z_FINISH,
  Z_SYNC_FLUSH: constants.Z_SYNC_FLUSH,
}
const deflateData = async (data: Uint8Array, options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] }) =>
  new Promise<Buffer>((resolve, reject) => {
    deflate(
      data,
      {
        finishFlush: options.finishFlush ? FINISH_FLUSH_MAP[options.finishFlush] : undefined,
      },
      (err, buf) => {
        if (err) {
          reject(err)
          return
        }
        resolve(buf)
      }
    )
  })
const inflateData = async (data: Uint8Array, options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] }) =>
  new Promise<Buffer>((resolve, reject) => {
    inflate(
      data,
      {
        finishFlush: options.finishFlush ? FINISH_FLUSH_MAP[options.finishFlush] : undefined,
      },
      (err, buf) => {
        if (err) {
          reject(err)
          return
        }
        resolve(buf)
      }
    )
  })
const gzipData = async (data: Uint8Array, options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] }) =>
  new Promise<Buffer>((resolve, reject) => {
    gzip(
      data,
      {
        finishFlush: options.finishFlush ? FINISH_FLUSH_MAP[options.finishFlush] : undefined,
      },
      (err, buf) => {
        if (err) {
          reject(err)
          return
        }
        resolve(buf)
      }
    )
  })
const gunzipData = async (data: Uint8Array, options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] }) =>
  new Promise<Buffer>((resolve, reject) => {
    gunzip(
      data,
      {
        finishFlush: options.finishFlush ? FINISH_FLUSH_MAP[options.finishFlush] : undefined,
      },
      (err, buf) => {
        if (err) {
          reject(err)
          return
        }
        resolve(buf)
      }
    )
  })
export const createUtils = (extension: AnyListen.Extension.Extension) => {
  return {
    async deflate<T extends 'base64' | 'binary' = 'binary'>(
      data: Uint8Array | string,
      encoding: T = 'binary' as T,
      options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] } = {}
    ): Promise<T extends 'base64' ? string : Uint8Array> {
      switch (encoding) {
        case 'binary':
        case 'base64':
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          throw new Error('Invalid format')
      }
      if (options.finishFlush && !FLUSH_OPTIONS.includes(options.finishFlush)) {
        throw new Error('Invalid finishFlush option')
      }
      const result = await deflateData(typeof data === 'string' ? Buffer.from(data) : data, options)
      return (encoding === 'base64' ? result.toString('base64') : new Uint8Array(result)) as T extends 'base64'
        ? string
        : Uint8Array
    },
    async inflate<T extends 'utf-8' | 'binary' = 'binary'>(
      data: Uint8Array | string,
      encoding: T = 'binary' as T,
      options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] } = {}
    ): Promise<T extends 'utf-8' ? string : Uint8Array> {
      switch (encoding) {
        case 'binary':
        case 'utf-8':
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          throw new Error('Invalid format')
      }
      if (options.finishFlush && !FLUSH_OPTIONS.includes(options.finishFlush)) {
        throw new Error('Invalid finishFlush option')
      }
      const result = await inflateData(typeof data === 'string' ? Buffer.from(data, 'base64') : data, options)
      return (encoding === 'utf-8' ? result.toString('utf-8') : new Uint8Array(result)) as T extends 'utf-8' ? string : Uint8Array
    },
    async gzip<T extends 'base64' | 'binary' = 'binary'>(
      data: Uint8Array | string,
      encoding: T = 'binary' as T,
      options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] } = {}
    ): Promise<T extends 'base64' ? string : Uint8Array> {
      switch (encoding) {
        case 'binary':
        case 'base64':
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          throw new Error('Invalid format')
      }
      if (options.finishFlush && !FLUSH_OPTIONS.includes(options.finishFlush)) {
        throw new Error('Invalid finishFlush option')
      }
      const result = await gzipData(typeof data === 'string' ? Buffer.from(data) : data, options)
      return (encoding === 'base64' ? result.toString('base64') : new Uint8Array(result)) as T extends 'base64'
        ? string
        : Uint8Array
    },
    async gunzip<T extends 'utf-8' | 'binary' = 'binary'>(
      data: Uint8Array | string,
      encoding: T = 'binary' as T,
      options: { finishFlush?: (typeof FLUSH_OPTIONS)[number] } = {}
    ): Promise<T extends 'utf-8' ? string : Uint8Array> {
      switch (encoding) {
        case 'binary':
        case 'utf-8':
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          throw new Error('Invalid format')
      }
      if (options.finishFlush && !FLUSH_OPTIONS.includes(options.finishFlush)) {
        throw new Error('Invalid finishFlush option')
      }
      const result = await gunzipData(typeof data === 'string' ? Buffer.from(data, 'base64') : data, options)
      return (encoding === 'utf-8' ? result.toString('utf-8') : new Uint8Array(result)) as T extends 'utf-8' ? string : Uint8Array
    },
  } as const
}
