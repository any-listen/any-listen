import { hostContext } from '@/host/state'

export const zlib: AnyListen_API.Zlib = {
  async deflate(data, encoding, options) {
    return hostContext.hostFuncs.deflate(data, encoding, options)
  },
  async inflate(data, encoding, options) {
    return hostContext.hostFuncs.inflate(data, encoding, options)
  },
  async gzip(data, encoding, options) {
    return hostContext.hostFuncs.gzip(data, encoding, options)
  },
  async gunzip(data, encoding, options) {
    return hostContext.hostFuncs.gunzip(data, encoding, options)
  },
}
