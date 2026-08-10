import zlib from 'node:zlib'

const COMPRESS_THRESHOLD = 1024

const gzip = async (data: string) => {
  return new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(data, (err, buf) => {
      if (err) {
        reject(new Error(err.message, { cause: err }))
        return
      }
      resolve(buf)
    })
  })
}
const unGzip = async (data: string) => {
  return new Promise<string>((resolve, reject) => {
    zlib.gunzip(Buffer.from(data, 'base64'), (err, buf) => {
      if (err) {
        reject(new Error(err.message, { cause: err }))
        return
      }
      resolve(buf.toString())
    })
  })
}

export const encodeData = async (data: string): Promise<string> => {
  const originalSize = Buffer.byteLength(data, 'utf8')
  if (originalSize <= COMPRESS_THRESHOLD) return data
  const compressed = await gzip(data)
  if (compressed.length >= originalSize) return data
  return `cg_${compressed.toString('base64')}`
}

export const decodeData = async (data: string): Promise<string> => {
  return data.startsWith('cg_') ? unGzip(data.replace('cg_', '')) : data
}

export const buildSnapshotFileName = (key: string) => {
  return `${Date.now()}_${key}`
}
export const parseSnapshotFileName = (fileName: string) => {
  return fileName.replace(/^\d+_/, '')
}
