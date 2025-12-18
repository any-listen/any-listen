import { hostContext } from '@/host/state'

export const musicUtils: AnyListen_API.MusicUtils = {
  async createProxyUrl(url: string, options: AnyListen_API.RequestOptions, enabledCache?: boolean) {
    return hostContext.hostFuncs.createProxyUrl(url, options, enabledCache)
  },
  async writeProxyCache(fileName: string, data: Uint8Array) {
    return hostContext.hostFuncs.writeProxyCache(fileName, data)
  },
}
