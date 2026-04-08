import { hostContext } from '@/host/state'

export const zlib: AnyListen_API.Zlib = {
  deflate(data, encoding) {
    return hostContext.hostFuncs.deflate(data, encoding)
  },
  inflate(data, encoding) {
    return hostContext.hostFuncs.inflate(data, encoding)
  },
}
