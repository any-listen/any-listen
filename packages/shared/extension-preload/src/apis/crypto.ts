import { hostContext } from '@/host/state'

export const crypto: AnyListen_API.Crypto = {
  async aesEncrypt(mode, data, key, iv) {
    if (typeof data != 'string') data = new Uint8Array(data)
    if (typeof key != 'string') key = new Uint8Array(key)
    if (typeof iv != 'string') iv = new Uint8Array(iv)
    return hostContext.hostFuncs.aesEncrypt(mode, data, key, iv)
  },
  async rsaEncrypt(mode, data, key) {
    if (typeof data != 'string') data = new Uint8Array(data)
    if (typeof key != 'string') key = new Uint8Array(key)
    return hostContext.hostFuncs.rsaEncrypt(mode, data, key)
  },
  async randomBytes(size: number) {
    const byteArray = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      byteArray[i] = Math.floor(Math.random() * 256) // 随机生成一个字节的值（0-255）
    }
    return byteArray
  },
  async md5(data) {
    if (typeof data != 'string') data = new Uint8Array(data)
    return hostContext.hostFuncs.md5(data)
  },
  async sha1(data) {
    if (typeof data != 'string') data = new Uint8Array(data)
    return hostContext.hostFuncs.sha1(data)
  },
  async sha256(data) {
    if (typeof data != 'string') data = new Uint8Array(data)
    return hostContext.hostFuncs.sha256(data)
  },
  async sha512(data) {
    if (typeof data != 'string') data = new Uint8Array(data)
    return hostContext.hostFuncs.sha512(data)
  },
}
