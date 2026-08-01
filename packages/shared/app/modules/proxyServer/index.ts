import fs from 'node:fs/promises'

import { buildVirtualPublicPath } from '@any-listen/common/tools'
import { checkAndCreateDir, checkFile, extname, joinPath, randomBytes, toMD5, toSha256 } from '@any-listen/nodejs'
import { verifyResource, type Options } from '@any-listen/nodejs/request'

// import { logs } from '../logs'
import { checkAllowedExt } from './shared'
import { proxyServerState } from './state'

export const generateName = (url: string) => {
  if (url.length > 2048) throw new Error('URL too long')

  const ext = extname(url)
  if (ext && !checkAllowedExt(ext)) throw new Error('Not allowed file type')

  return (toSha256(`${url}.${Date.now()}`) + ext).toLowerCase()
}

export const createProxy = async (url: string, reqOptions: Options = {}, enabledCache?: boolean) => {
  // logs.ProxyService.logcat.info('createProxy', url, reqOptions, enabledCache)
  await verifyResource(url, reqOptions)

  const name = generateName(url)
  proxyServerState.proxyMap.set(name, {
    requestOptions: reqOptions,
    url,
    enabledCache,
  })
  return buildVirtualPublicPath(proxyServerState.proxyBaseUrl, name)
}

export const checkProxyCache = async (url: string) => {
  const name = generateName(url)
  return checkFile(joinPath(proxyServerState.cacheDir, name))
}

export const writeProxyCache = async (fileName: string, data: Uint8Array) => {
  const name = generateName(fileName)
  const filePath = joinPath(proxyServerState.cacheDir, name)
  await fs.writeFile(filePath, data)
  return buildVirtualPublicPath(proxyServerState.proxyBaseUrl, name)
}

export const initProxyServer = async (proxyHost: string, proxyBaseUrl: string, cacheDir: string) => {
  // server ||= http.createServer()
  proxyServerState.proxyHost = proxyHost
  proxyServerState.proxyBaseUrl = proxyBaseUrl
  proxyServerState.cacheDir = `${cacheDir}/proxy`
  await checkAndCreateDir(proxyServerState.cacheDir)
}

export const getProxyUrlKey = async () => {
  if (proxyServerState.proxyUrlKey) return proxyServerState.proxyUrlKey
  const key = toMD5(randomBytes(16))
  proxyServerState.proxyUrlKey = key
  return key
}

export { proxyRequest, proxyRequestByUrl } from './proxy'
export { proxyServerState } from './state'
