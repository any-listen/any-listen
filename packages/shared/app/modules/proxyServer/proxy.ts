import fs, { type ReadStream } from 'node:fs'
import type { IncomingHttpHeaders } from 'node:http'
import { PassThrough } from 'node:stream'

import { getMimeType } from '@any-listen/common/mime'
import { isUrl } from '@any-listen/common/utils'
import { extname, getFileStats, joinPath, removeFileIgnoreError } from '@any-listen/nodejs'
import { request, type Response } from '@any-listen/nodejs/request'

import { checkAllowedExt, parseRange, TEMP_FILE_EXT } from './shared'
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

const getCachedFile = async (id: string, rangeHeader?: string): Promise<Result | null> => {
  const filePath = joinPath(proxyServerState.cacheDir, id)
  const stat = await getFileStats(filePath)
  if (!stat) return null
  const range = parseRange(rangeHeader)
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

const isFullRange = (contentRange?: string, size?: number) => {
  if (!contentRange || size == null) return true
  const result = /bytes (\d+)-(\d+)(?:\/(\d+))?/.exec(contentRange)
  if (!result) return true
  const start = parseInt(result[1], 10)
  const end = parseInt(result[2], 10)
  const total = result[3] ? parseInt(result[3], 10) : size
  return start === 0 && end === total - 1
}
const excludeHeaders = ['host', 'connection', 'origin', 'referer']
const removeExcludeHeaders = (headers?: IncomingHttpHeaders) => {
  if (headers) {
    for (const header of excludeHeaders) {
      if (header in headers) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete headers[header]
      }
    }
  }
}
export const proxyRequest = async (name: string, rawHeaders?: IncomingHttpHeaders): Promise<Result | null> => {
  if (name.length > 128 || !/^[\w.]+$/.test(name)) return null

  const ext = extname(name)
  if (ext && !checkAllowedExt(ext)) return null

  // check cache
  const result = await getCachedFile(name, rawHeaders?.range)
  if (result) return result

  const proxyInfo = proxyServerState.proxyMap.get(name)
  if (!proxyInfo) return null

  removeExcludeHeaders(rawHeaders)

  const resp = await request<ReadStream>(proxyInfo.url, {
    ...proxyInfo.requestOptions,
    headers: {
      ...((rawHeaders ?? {}) as Record<string, string | string[]>),
      ...(proxyInfo.requestOptions.headers ?? {}),
    },
    needBody: true,
  })

  if (!resp.statusCode || resp.statusCode < 200 || (resp.statusCode >= 300 && resp.statusCode !== 304)) {
    console.log(`Proxy request failed: ${resp.statusCode}`)
    return null
  }

  let tee: PassThrough | undefined
  if (
    proxyInfo.enabledCache &&
    resp.statusCode !== 304 &&
    isFullRange(resp.headers['content-range'], parseInt(resp.headers['content-length'] ?? '0', 10)) &&
    !proxyServerState.activeWriteStreams.has(name)
  ) {
    // If the range is not specified, we can cache the entire file
    const filePath = joinPath(proxyServerState.cacheDir, name)
    const tempPath = `${filePath}${TEMP_FILE_EXT}`
    await removeFileIgnoreError(filePath)
    // use PassThrough to pipe the response body to both the caller and the file
    tee = new PassThrough()
    resp.body.pipe(tee)
    const writeStream = fs.createWriteStream(tempPath, { flags: 'w' })
    resp.body.pipe(writeStream)
    resp.body.on('error', (err) => {
      console.log('resp body error', err)
      writeStream.destroy()
      void removeFileIgnoreError(filePath)
    })
    writeStream.on('finish', () => {
      fs.rename(tempPath, filePath, (err) => {
        if (err) fs.unlink(tempPath, () => {})
      })
    })
    writeStream.on('error', () => {
      fs.unlink(filePath, () => {})
    })
    writeStream.on('close', () => {
      proxyServerState.activeWriteStreams.delete(name)
    })
    proxyServerState.activeWriteStreams.set(name, writeStream)
  }
  return {
    statusCode: resp.statusCode,
    headers: resp.headers,
    body: tee || resp.body,
  }
}

export const proxyRequestByUrl = async (url: string, rawHeaders?: IncomingHttpHeaders): Promise<Result | null> => {
  if (url.length > 4096 || !isUrl(url)) return null

  const ext = extname(url)
  if (ext && !checkAllowedExt(ext)) return null

  removeExcludeHeaders(rawHeaders)

  const resp = await request<ReadStream>(url, {
    headers: rawHeaders as Record<string, string | string[]>,
    needBody: true,
  })

  if (!resp.statusCode || resp.statusCode < 200 || (resp.statusCode >= 300 && resp.statusCode !== 304)) {
    console.log(`Proxy request failed: ${resp.statusCode}`)
    return null
  }

  return {
    statusCode: resp.statusCode,
    headers: resp.headers,
    body: resp.body,
  }
}
