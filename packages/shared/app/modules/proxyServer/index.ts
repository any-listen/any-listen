import { buildPublicPath } from '@any-listen/common/tools'
import { checkAndCreateDir, checkFile, extname, joinPath, toSha256 } from '@any-listen/nodejs'
import { request, type Options } from '@any-listen/nodejs/request'
import fs from 'node:fs/promises'
import { checkAllowedExt } from './shared'
import { proxyServerState } from './state'

const verifyOptions = async (url: string, opts: Options) => {
  const resp = await request(url, {
    ...opts,
    headers: {
      ...(opts.headers ?? {}),
      Range: 'bytes=0-1',
    },
  })
  if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
    throw new Error(`verify proxy request failed: [${url}] ${resp.statusCode}`)
  }
}

export const generateName = (url: string) => {
  if (url.length > 1024) throw new Error('URL too long')

  const ext = extname(url)
  if (ext && !checkAllowedExt(ext)) throw new Error('Not allowed file type')

  return (toSha256(url) + ext).toLocaleLowerCase()
}

export const createProxy = async (url: string, reqOptions: Options) => {
  await verifyOptions(url, reqOptions)

  const name = generateName(url)
  proxyServerState.proxyMap.set(name, {
    requestOptions: reqOptions,
    url,
  })
  return buildPublicPath(proxyServerState.proxyBaseUrl, name)
}

export const checkProxyCache = async (url: string) => {
  const name = generateName(url)
  return checkFile(joinPath(proxyServerState.cacheDir, name))
}

export const writeProxyCache = async (fileName: string, data: Uint8Array) => {
  const name = generateName(fileName)
  const filePath = joinPath(proxyServerState.cacheDir, name)
  await fs.writeFile(filePath, data)
  return buildPublicPath(proxyServerState.proxyBaseUrl, name)
}

export const initProxyServer = async (proxyBaseUrl: string, cacheDir: string) => {
  // server ||= http.createServer()
  proxyServerState.proxyBaseUrl = proxyBaseUrl
  proxyServerState.cacheDir = `${cacheDir}/proxy`
  await checkAndCreateDir(proxyServerState.cacheDir)
}

export { proxyRequest } from './proxy'
export { proxyServerState } from './state'
