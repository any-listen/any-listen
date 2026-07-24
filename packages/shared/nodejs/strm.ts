import { createCache } from '@any-listen/common/cache'
import { getMimeType } from '@any-listen/common/mime'
import { sizeFormate, isUrl } from '@any-listen/common/utils'

import { basename, extname, readFile } from '.'
import { type FileMetadata, parseBufferMetadata } from './music-metadata'
import { request, type NeedBodyType } from './request'

type MetaData = FileMetadata & Awaited<ReturnType<typeof parseBufferMetadata>>
const cache = createCache<MetaData>({ max: 30, ttl: 60 * 1000 })
const nextLenMap = {
  0: 8 * 1024,
  [8 * 1024]: 16 * 1024,
  [16 * 1024]: 32 * 1024,
  [32 * 1024]: 64 * 1024,
  [64 * 1024]: 96 * 1024,
  [96 * 1024]: 128 * 1024,
  [128 * 1024]: 192 * 1024,
  [192 * 1024]: 256 * 1024,
}
const MAX_META_LENGTH = 128 * 1024

const getPartialData = async (url: string, start?: number, end?: number) => {
  console.log(url, start, end)
  const resp = await request<NeedBodyType>(url, {
    needBody: true,
    headers: { Range: `bytes=${start || '0'}-${end || ''}` },
  })
  return {
    headers: resp.headers,
    body: await resp.body.bytes(),
    url: resp.history.at(-1) ?? url,
  }
}
const getHead = async (url: string) => {
  const resp = await request<NeedBodyType>(url, {
    method: 'HEAD',
  })
  return resp.headers
}
const requestParseMetadata = async ({
  url,
  mimeType,
  isMetaOnly = false,
  needCache = false,
  data = Buffer.alloc(0),
  preLength = 0,
}: {
  url: string
  mimeType?: string
  isMetaOnly?: boolean
  needCache?: boolean
  data?: Buffer
  preLength?: number
}): Promise<MetaData | null> => {
  if (cache.has(url)) return cache.get(url)!
  let nextLength = nextLenMap[preLength]
  if (!nextLength || (isMetaOnly && nextLength > MAX_META_LENGTH)) return null
  const resp = await getPartialData(url, preLength, nextLength - 1)
  data = Buffer.concat([data, resp.body]) // first 8k
  mimeType ||= resp.headers['content-type'] || getMimeType(basename(resp.url))
  const ext = extname(resp.url).replace(/^\./, '')
  const metaHead = await parseBufferMetadata(data, mimeType, ext).catch(() => {
    // logcat.error('parseBufferMetadata error', err)
    return null
  })
  if (!metaHead) return null
  if (metaHead.name || metaHead.singer || metaHead.albumName) {
    const metadata: MetaData = {
      ...metaHead,
      unparsed: false,
      ext,
      sizeStr: sizeFormate(parseInt(resp.headers['content-length'] || '0', 10) || 0),
    }
    if (needCache) cache.set(url, metadata)
    return metadata
  }
  // logcat.info('try next length', nextLenMap[nextLength])
  return requestParseMetadata({ url, mimeType, isMetaOnly, needCache, data, preLength: nextLength })
}
let requestParseMetadataPromises = new Map<string, ReturnType<typeof requestParseMetadata>>()
const handleParseMetadata = async (opts: {
  url: string
  isMetaOnly?: boolean
  needCache?: boolean
}): Promise<MetaData | null> => {
  if (cache.has(opts.url)) return cache.get(opts.url)!
  if (requestParseMetadataPromises.has(opts.url)) return requestParseMetadataPromises.get(opts.url)!
  const promise = requestParseMetadata(opts).finally(() => {
    requestParseMetadataPromises.delete(opts.url)
  })
  requestParseMetadataPromises.set(opts.url, promise)
  return promise
}

export const parseMusicMetadata = async (url: string): Promise<MetaData | null> => {
  // const mimeType = getMimeType(basename(url))
  const metaHead = await handleParseMetadata({ url, isMetaOnly: true })
  // logcat.info('metaHead', metaHead)
  if (metaHead?.name || metaHead?.singer || metaHead?.albumName) return metaHead
  const headers = await getHead(url)
  const fileSize = parseInt(headers['content-length'] || '0', 10)
  if (isNaN(fileSize) || !fileSize) {
    console.error('Get file size error', url, headers)
    return null
  }
  const resp = await getPartialData(url, fileSize - 32 * 1024) // last 32k
  const mimeType = resp.headers['content-type'] || getMimeType(basename(resp.url))
  const ext = extname(resp.url).replace(/^\./, '')
  const metaTail = await parseBufferMetadata(Buffer.from(resp.body), mimeType, ext).catch(() => {
    // logcat.error('parseBufferMetadata error', err)
    return null
  })
  // logcat.info('metaTail', metaTail)
  if (metaTail?.name || metaTail?.singer || metaTail?.albumName) {
    return {
      ...metaTail,
      unparsed: false,
      ext,
      sizeStr: sizeFormate(fileSize),
    }
  }
  return null
}

// const checkFile = async (webDAVClient: WebDAVClient, path: string) => {
//   return webDAVClient
//     .getPartial(path, 0, 1)
//     .then(() => true)
//     .catch(() => false)
// }

const getFileUrl = async (path: string) => {
  const content = (await readFile(path, 'utf8').catch(() => '')) as string
  const url = content
    .split(/\r?\n/)
    .find((line) => line.trim() !== '')
    ?.trim()

  return url && isUrl(url) ? url : null
}
const parseStrmFileMetadata = async (path: string) => {
  const url = await getFileUrl(path)
  if (!url) return null
  return parseMusicMetadata(url)
}

export const buildStrmFileMetadata = async (path: string, parseMetadata = true): Promise<FileMetadata | null> => {
  if (parseMetadata) {
    const data = await parseStrmFileMetadata(path)
    if (!data) return null
    const { pic, lyric, ...metadata } = data
    return metadata
  }
  const ext = extname(path)
  const name = basename(path, ext)
  return {
    unparsed: true,
    name,
    singer: '',
    interval: null,
    albumName: '',
    sizeStr: '',
    ext: '',
    bitrateLabel: '',
    year: 0,
    trackNo: null,
    discNo: null,
  }
}

export const getStrmFileUrl = async (path: string) => {
  if (!path || typeof path !== 'string') throw new Error('invalid path')
  return getFileUrl(path)
}

export const getStrmFilePic = async (path: string) => {
  const url = await getFileUrl(path)
  if (!url) return null
  const metaHead = await handleParseMetadata({ url, isMetaOnly: false, needCache: true })
  return metaHead?.pic || null
}

export const getStrmFileLyric = async (path: string) => {
  const url = await getFileUrl(path)
  if (!url) return null
  const metaHead = await handleParseMetadata({ url, isMetaOnly: false, needCache: true })
  return metaHead?.lyric || null
}
