import { hostContext } from '@/host/state'

import { buffer } from './buffer'

// const dataToB64 = (data) => {
//   if (typeof data === 'string') return nativeFuncs.utils_str2b64(data)
//   else if (Array.isArray(data) || ArrayBuffer.isView(data)) return utils.buffer.bufToString(data, 'base64')
//   throw new Error('data type error: ' + typeof data + ' raw data: ' + data)
// }

export const crypto: AnyListen_API.Crypto = {
  aesEncrypt(mode: AnyListen.ExtensionVM.AES_MODE, data: Uint8Array | string, key: Uint8Array | string, iv: Uint8Array | string) {
    if (typeof data != 'string') data = buffer.bufToString(data, 'utf8')
    if (typeof key != 'string') key = buffer.bufToString(key, 'utf8')
    if (typeof iv != 'string') iv = buffer.bufToString(iv, 'utf8')
    return hostContext.utils_aes_encrypt(mode, buffer.from(data), key, iv)
  },
  rsaEncrypt(mode: AnyListen.ExtensionVM.RSA_PADDING, data: Uint8Array | string, key: Uint8Array | string) {
    if (typeof data != 'string') data = buffer.bufToString(data, 'utf8')
    if (typeof key != 'string') key = buffer.bufToString(key, 'utf8')
    return hostContext.utils_rsa_encrypt(mode, data, key)
  },
  randomBytes(size: number) {
    const byteArray = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      byteArray[i] = Math.floor(Math.random() * 256) // 随机生成一个字节的值（0-255）
    }
    return byteArray
  },
  md5(dara: string) {
    return hostContext.utils_str2md5(dara)
  },
}
