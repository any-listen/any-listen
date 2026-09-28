import { createCache } from '@any-listen/common/cache'
import { getMimeType } from '@any-listen/common/mime'
import { isLikelyGarbage } from '@any-listen/common/utils'
import { basename, extname, extnameRaw, sleep } from '@any-listen/nodejs'
import { decodeString } from '@any-listen/nodejs/char'
import { parseBufferMetadata } from '@any-listen/nodejs/music'
import { WebDAVClient } from '@any-listen/nodejs/webdav-client'

import { hostContext, logcat } from './shared'
import { debugLog, getEnabledCache, savePassword } from './utils'

const cache = createCache({ max: 80, ttl: 60 * 1000, updateAgeOnGet: true })

export interface WebDAVClientOptions {
  url: string
  username: string
  password?: string
  path: string
}

export type { WebDAVClient, WebDAVFileItem, WebDAVItem } from '@any-listen/nodejs/webdav-client'

export const createWebDAVClient = (options: WebDAVClientOptions) => {
  return new WebDAVClient({
    baseUrl: options.url,
    username: options.username,
    password: options.password,
    onError(err) {
      logcat.error('WebDAVClient', err)
    },
    async onDebugLog(logMessage) {
      void debugLog(logMessage)
    },
  })
}

export const buildWebDAVError = (options: WebDAVClientOptions, err: Error) => {
  const msg = err.message
  if (msg.startsWith('401')) {
    if (!options.password) {
      return Error(hostContext.i18n.t('exts.webdav.form.error.no_password'))
    }
    return Error(hostContext.i18n.t('exts.webdav.form.error.invalid_password'))
  }
  return err
}

export const setPassword = async (options: WebDAVClientOptions) => {
  const password = await hostContext.showInputBox({
    placeholder: hostContext.i18n.t('exts.webdav.form.input.password_placeholder'),
    // password: true,
    title: hostContext.i18n.t('exts.webdav.form.input.password_title'),
    prompt: options.password
      ? hostContext.i18n.t('exts.webdav.form.error.invalid_password_prompt')
      : hostContext.i18n.t('exts.webdav.form.error.no_password_prompt'),
    async validateInput(value) {
      const webDAVClient = createWebDAVClient({ ...options, password: value })
      return webDAVClient
        .ls(options.path)
        .then(() => {
          return null
        })
        .catch(async (err: Error) => {
          const msg = err.message
          if (msg.startsWith('401')) {
            if (!value) return hostContext.i18n.t('exts.webdav.form.error.no_password_prompt')
            return hostContext.i18n.t('exts.webdav.form.error.invalid_password_prompt')
          }
          return null
        })
    },
  })
  await savePassword(options.url, options.username, password).catch((err) => {
    logcat.error('setPassword error', err)
    throw err
  })
  options.password = password
}

export const testDir = async (options: WebDAVClientOptions) => {
  const webDAVClient = createWebDAVClient(options)
  await webDAVClient.ls(options.path).catch(async (err: Error) => {
    const msg = err.message
    if (msg.startsWith('401')) {
      if ((await setPassword(options).catch(() => 1)) !== 1) {
        await sleep(500)
        return testDir(options)
      }
      if (!options.password) {
        throw Error(hostContext.i18n.t('exts.webdav.form.error.test_no_password'))
      }
      throw Error(hostContext.i18n.t('exts.webdav.form.error.test_invalid_password'))
    }
    throw buildWebDAVError(options, err)
  })
}

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
const MAX_TAG_SIZE = nextLenMap[192 * 1024] * 3
const requestParseMetadata = async ({
  webDAVClient,
  path,
  mimeType,
  isMetaOnly = false,
  needCache = false,
  data = Buffer.alloc(0),
  preLength = 0,
  tagSize,
  emptyMeta = false,
  ext = extname(path).replace(/^\./, ''),
}: {
  webDAVClient: WebDAVClient
  path: string
  mimeType: string
  isMetaOnly?: boolean
  needCache?: boolean
  data?: Buffer
  preLength?: number
  tagSize?: number
  emptyMeta?: boolean
  ext?: string
}) => {
  if (cache.has(path)) return cache.get<ReturnType<typeof parseBufferMetadata>>(path)!
  let nextLength = nextLenMap[preLength]
  if (tagSize) {
    nextLength = tagSize
  } else if (!nextLength || (isMetaOnly && emptyMeta && nextLength > MAX_META_LENGTH)) return null
  void debugLog(`try length: ${nextLength}`)
  data = Buffer.concat([data, await webDAVClient.getPartial(path, preLength, nextLength - 1)]) // first 8k
  const metaHead = await parseBufferMetadata(data, mimeType, ext).catch((err: Error) => {
    void debugLog(`parseBufferMetadata error: ${err.message}`)
    if (err.message.includes('exceeds remaining file')) {
      if (tagSize) {
        tagSize = 0
      } else {
        const _tagSize = parseInt(/tag size (\d+)/.exec(err.message)?.[1] || '0', 10)
        if (_tagSize > 0 && _tagSize < MAX_TAG_SIZE) {
          tagSize = _tagSize + nextLength
        }
      }
    }
    return null
  })
  if (metaHead) {
    if (metaHead.name || metaHead.singer || metaHead.albumName) {
      if (needCache) cache.set(path, metaHead)
      return metaHead
    }
    emptyMeta = true
  }
  return requestParseMetadata({
    webDAVClient,
    path,
    mimeType,
    isMetaOnly,
    needCache,
    data,
    preLength: nextLength,
    tagSize,
    emptyMeta,
    ext,
  })
}
let requestParseMetadataPromises = new Map<string, ReturnType<typeof requestParseMetadata>>()
const handleParseMetadata = async (opts: {
  webDAVClient: WebDAVClient
  path: string
  mimeType: string
  isMetaOnly?: boolean
  needCache?: boolean
}) => {
  if (cache.has(opts.path)) return cache.get<ReturnType<typeof parseBufferMetadata>>(opts.path)!
  if (requestParseMetadataPromises.has(opts.path)) return requestParseMetadataPromises.get(opts.path)!
  const promise = requestParseMetadata(opts).finally(() => {
    requestParseMetadataPromises.delete(opts.path)
  })
  requestParseMetadataPromises.set(opts.path, promise)
  return promise
}

const buildMetaLog = (meta: Awaited<ReturnType<typeof handleParseMetadata>>) => {
  if (!meta) return 'meta is null'
  const { pic, ...rest } = meta
  return `${JSON.stringify(rest)}, pic: ${pic ? `format: ${pic.format}, size: ${pic.data.byteLength}` : 'null'}`
}
export const parseMusicMetadata = async (
  options: WebDAVClientOptions,
  path: string,
  fileSize?: number,
  ext = extname(path).replace(/^\./, '')
) => {
  const webDAVClient = createWebDAVClient(options)
  const mimeType = getMimeType(basename(path))
  const metaHead = await handleParseMetadata({ webDAVClient, path, mimeType, isMetaOnly: true, needCache: true })
  void debugLog(`metaHead: ${buildMetaLog(metaHead)}`)
  if (metaHead?.name || metaHead?.singer || metaHead?.albumName) return metaHead
  if (!fileSize) {
    const headers = await webDAVClient.getHead(path)
    fileSize = parseInt(headers['content-length'] || '0', 10)
    if (isNaN(fileSize) || !fileSize) {
      logcat.error('Get file size error', path, headers)
      return null
    }
  }
  const data = await webDAVClient.getPartial(path, fileSize - 32 * 1024) // last 32k
  const metaTail = await parseBufferMetadata(data, mimeType, ext).catch((err: Error) => {
    void debugLog(`parseBufferMetadata error: ${err.message}`)
    return null
  })
  void debugLog(`metaTail: ${buildMetaLog(metaTail)}`)
  if (metaTail?.name || metaTail?.singer || metaTail?.albumName) return metaTail
  return null
}

// const checkFile = async (webDAVClient: WebDAVClient, path: string) => {
//   return webDAVClient
//     .getPartial(path, 0, 1)
//     .then(() => true)
//     .catch(() => false)
// }

export const getMusicUrl = async (options: WebDAVClientOptions, path: string) => {
  if (!path || typeof path !== 'string') throw new Error('invalid path')
  const webDAVClient = createWebDAVClient(options)
  const [url, reqOpts] = webDAVClient.getRequestOptions(path)
  return hostContext.createProxyUrl(url, reqOpts, await getEnabledCache()).catch((err) => {
    logcat.error('create proxy url error', err)
    throw err
  })
}

const tryPicExt = ['.jpg', '.jpeg', '.png'] as const
const getDirCoverPic = async (webDAVClient: WebDAVClient, path: string) => {
  const filePath = new RegExp(`\\${extnameRaw(path)}$`)
  for await (const ext of tryPicExt) {
    const picPath = path.replace(filePath, ext)
    const [url, reqOpts] = webDAVClient.getRequestOptions(picPath)
    const picUrl = await hostContext.createProxyUrl(url, reqOpts, await getEnabledCache()).catch(() => null)
    if (picUrl) return picPath
  }
  return null
}
const getDirNamePic = async (webDAVClient: WebDAVClient, path: string) => {
  const filePath = new RegExp(`\\${extnameRaw(path)}$`)
  for await (const ext of tryPicExt) {
    const picPath = path.replace(filePath, ext)
    const [url, reqOpts] = webDAVClient.getRequestOptions(picPath)
    const picUrl = await hostContext.createProxyUrl(url, reqOpts, await getEnabledCache()).catch(() => null)
    if (picUrl) return picPath
  }
  return null
}
export const getMusicPic = async (options: WebDAVClientOptions, path: string) => {
  const webDAVClient = createWebDAVClient(options)
  let pic = await getDirNamePic(webDAVClient, path)
  if (pic) return pic

  const mimeType = getMimeType(basename(path))
  const metaHead = await handleParseMetadata({ webDAVClient, path, mimeType, isMetaOnly: false, needCache: true })
  if (metaHead?.pic) {
    const filePath = new RegExp(`\\${extnameRaw(path)}$`)
    const [type, ext] = metaHead.pic.format.split('/')
    if (type == 'image') {
      const [url] = webDAVClient.getRequestOptions(path.replace(filePath, `.${ext}`))
      return hostContext.writeProxyCache(url, metaHead.pic.data)
    }
  }

  pic = await getDirCoverPic(webDAVClient, path)
  if (pic) return pic
  throw new Error('get pic failed')
}

export const getMusicLyric = async (options: WebDAVClientOptions, path: string) => {
  const webDAVClient = createWebDAVClient(options)
  const lrcPath = path.replace(new RegExp(`\\${extnameRaw(path)}$`), '.lrc')

  const data = await webDAVClient.get(lrcPath).catch(() => null)
  if (data) {
    const lrc = await decodeString(data)
    if (lrc && !isLikelyGarbage(lrc)) return lrc
  }

  const mimeType = getMimeType(basename(path))
  const metaHead = await handleParseMetadata({ webDAVClient, path, mimeType, isMetaOnly: false, needCache: true })
  return metaHead?.lyric || null
}
