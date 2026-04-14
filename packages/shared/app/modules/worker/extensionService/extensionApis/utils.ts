import { deflate, inflate } from 'node:zlib'

const deflateData = async (data: Uint8Array) =>
  new Promise<Buffer>((resolve, reject) => {
    deflate(data, (err, buf) => {
      if (err) {
        reject(err)
        return
      }
      resolve(buf)
    })
  })
const inflateData = async (data: Uint8Array) =>
  new Promise<Buffer>((resolve, reject) => {
    inflate(data, (err, buf) => {
      if (err) {
        reject(err)
        return
      }
      resolve(buf)
    })
  })
export const createUtils = (extension: AnyListen.Extension.Extension) => {
  return {
    async deflate<T extends 'base64' | 'binary' = 'binary'>(
      data: Uint8Array | string,
      encoding?: T
    ): Promise<T extends 'base64' ? string : Uint8Array> {
      if (encoding === undefined) encoding = 'binary' as T
      switch (encoding) {
        case 'binary':
        case 'base64':
          break
        default:
          throw new Error('Invalid format')
      }
      const result = await deflateData(typeof data === 'string' ? Buffer.from(data) : data)
      return (encoding === 'base64' ? result.toString('base64') : new Uint8Array(result)) as T extends 'base64'
        ? string
        : Uint8Array
    },
    async inflate<T extends 'utf-8' | 'binary' = 'binary'>(
      data: Uint8Array | string,
      encoding?: T
    ): Promise<T extends 'utf-8' ? string : Uint8Array> {
      if (encoding === undefined) encoding = 'binary' as T
      switch (encoding) {
        case 'binary':
        case 'utf-8':
          break
        default:
          throw new Error('Invalid format')
      }
      const result = await inflateData(typeof data === 'string' ? Buffer.from(data, 'base64') : data)
      return (encoding === 'utf-8' ? result.toString('utf-8') : new Uint8Array(result)) as T extends 'utf-8' ? string : Uint8Array
    },
  } as const
}
