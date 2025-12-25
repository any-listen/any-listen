import { clearCache as clearProxyCache, getCacheSize as getProxyCacheSize } from './modules/proxyServer/shared'

export const getCacheSize = async () => {
  const size = await getProxyCacheSize()
  return size
}

export const clearCache = async () => {
  await clearProxyCache()
}
