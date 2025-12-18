import { getMimeType } from '@any-listen/common/mime'
import { extname, getFileStats, joinPath, removeFile } from '@any-listen/nodejs'
import { request, type Response } from '@any-listen/nodejs/request'
import fs, { type ReadStream } from 'node:fs'
import { PassThrough } from 'node:stream'
import { checkAllowedExt, parseRange } from './shared'
import { proxyServerState } from './state'

export interface Result {
  statusCode: number
  headers: Response<unknown>['headers']
  body?: ReadStream | PassThrough
}

// const NOT_FOUND_RESULT: Result = {
//   statusCode: 404,
//   headers: {
//     'content-type': 'text/plain',
//   },
// }
const RANGE_NOT_SATISFIABLE_RESULT: Result = {
  statusCode: 416,
  headers: {
    'content-type': 'text/plain',
  },
}

const getCachedFile = async (id: string, range?: { start?: number; end?: number }): Promise<Result | null> => {
  const filePath = joinPath(proxyServerState.cacheDir, id)
  const stat = await getFileStats(filePath)
  if (!stat) return null
  const size = stat.size
  let finalStart = 0
  let finalEnd = size - 1
  if (range) {
    if (range.start != null) {
      if (range.start >= size) return RANGE_NOT_SATISFIABLE_RESULT
      finalStart = range.start
    }
    if (range.end != null) {
      if (range.end >= size) return RANGE_NOT_SATISFIABLE_RESULT
      finalEnd = range.end
    }
  }

  return {
    headers: {
      'content-range': `bytes ${finalStart}-${finalEnd}/${size}`,
      'accept-ranges': 'bytes',
      'content-length': (finalEnd - finalStart + 1).toString(),
      'content-type': getMimeType(id),
      'cache-control': 'public, max-age=31536000, immutable',
      'last-modified': stat.mtime.toUTCString(),
    },
    statusCode: range ? 206 : 200,
    body: fs.createReadStream(filePath, { start: finalStart, end: finalEnd }),
  }
}

export const proxyRequest = async (name: string, rangeHeader?: string): Promise<Result | null> => {
  if (name.length > 80 || !/^[\w.]+$/.test(name)) return null

  const ext = extname(name)
  if (ext && !checkAllowedExt(ext)) return null

  const range = parseRange(rangeHeader)
  if (range === null) return RANGE_NOT_SATISFIABLE_RESULT

  // check cache
  const result = await getCachedFile(name, range)
  if (result) return result

  const proxyInfo = proxyServerState.proxyMap.get(name)
  if (!proxyInfo) return null

  const resp = await request<ReadStream>(proxyInfo.url, {
    ...proxyInfo.requestOptions,
    headers: {
      ...(proxyInfo.requestOptions.headers ?? {}),
      ...(range ? { Range: `bytes=${range.start || 0}-${range.end || ''}` } : {}),
    },
    needBody: true,
  })

  if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
    console.log(`Proxy request failed: ${resp.statusCode}`)
    return null
  }

  let tee: PassThrough | undefined
  if (proxyInfo.enabledCache && range && !range.start && !range.end && !proxyServerState.activeWriteStreams.has(name)) {
    // If the range is not specified, we can cache the entire file
    const filePath = joinPath(proxyServerState.cacheDir, name)
    const tempPath = `${filePath}.tmp`
    await removeFile(filePath).catch(() => {})
    // use PassThrough to pipe the response body to both the caller and the file
    tee = new PassThrough()
    resp.body.pipe(tee)
    const writeStream = fs.createWriteStream(tempPath, { flags: 'w' })
    resp.body.pipe(writeStream)
    resp.body.on('error', (err) => {
      console.log('resp body error', err)
      writeStream.destroy()
      void removeFile(filePath).catch(() => {})
    })
    writeStream.on('finish', () => {
      fs.rename(tempPath, filePath, (err) => {
        if (err) fs.unlink(tempPath, () => null)
      })
    })
    writeStream.on('error', () => {
      fs.unlink(filePath, () => null)
    })
    writeStream.on('close', () => {
      proxyServerState.activeWriteStreams.delete(name)
    })
    proxyServerState.activeWriteStreams.set(name, writeStream)
  }
  const headers: Record<string, string> = {}
  if (resp.headers['content-type']) headers['content-type'] = resp.headers['content-type']
  if (resp.headers['content-length']) headers['content-length'] = resp.headers['content-length']
  if (resp.headers['content-range']) headers['content-range'] = resp.headers['content-range']
  if (resp.headers['accept-ranges']) headers['accept-ranges'] = resp.headers['accept-ranges']
  if (resp.headers['last-modified']) headers['last-modified'] = resp.headers['last-modified']
  if (resp.headers['cache-control']) headers['cache-control'] = resp.headers['cache-control']
  return {
    statusCode: resp.statusCode,
    headers,
    body: tee || resp.body,
  }
}
