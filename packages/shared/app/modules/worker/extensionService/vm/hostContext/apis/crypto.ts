import { randomBytes as getRandomBytes, toMD5, toSha1, toSha256, toSha512 } from '@any-listen/nodejs'

import { utils_aes_decrypt, utils_aes_encrypt, utils_rsa_decrypt, utils_rsa_encrypt } from '../hostFuncs'

const availableEncoding: AnyListen.ExtensionVM.EncryptEncoding[] = ['base64', 'binary', 'utf-8']

export const createCrypto = (extension: AnyListen.Extension.Extension) => {
  return {
    async aesEncrypt(
      mode: AnyListen.ExtensionVM.AES_MODE,
      data: Uint8Array | string,
      key: Uint8Array | string,
      iv: Uint8Array | string
    ) {
      return utils_aes_encrypt(mode, data, key, iv)
    },
    async aesDecrypt<T extends AnyListen.ExtensionVM.EncryptEncoding = 'binary'>(
      mode: AnyListen.ExtensionVM.AES_MODE,
      data: Uint8Array | string,
      key: Uint8Array | string,
      iv: Uint8Array | string,
      encoding?: T
    ) {
      if (encoding && !availableEncoding.includes(encoding)) {
        throw new Error(`Unsupported encoding format: ${encoding}`)
      }
      return utils_aes_decrypt(mode, data, key, iv, encoding) as T extends 'binary' ? Uint8Array : string
    },
    async rsaEncrypt(mode: AnyListen.ExtensionVM.RSA_PADDING, data: Uint8Array | string, key: Uint8Array | string) {
      return utils_rsa_encrypt(mode, data, key)
    },
    async rsaDecrypt<T extends AnyListen.ExtensionVM.EncryptEncoding = 'binary'>(
      mode: AnyListen.ExtensionVM.RSA_PADDING,
      data: Uint8Array | string,
      key: Uint8Array | string,
      encoding?: T
    ) {
      if (encoding && !availableEncoding.includes(encoding)) {
        throw new Error(`Unsupported encoding format: ${encoding}`)
      }
      return utils_rsa_decrypt(mode, data, key, encoding) as T extends 'binary' ? Uint8Array : string
    },
    async md5(data: Uint8Array | string) {
      if (typeof data != 'string') data = new Uint8Array(data)
      return toMD5(data)
    },
    async sha1(data: Uint8Array | string) {
      if (typeof data != 'string') data = new Uint8Array(data)
      return toSha1(data)
    },
    async sha256(data: Uint8Array | string) {
      if (typeof data != 'string') data = new Uint8Array(data)
      return toSha256(data)
    },
    async sha512(data: Uint8Array | string) {
      if (typeof data != 'string') data = new Uint8Array(data)
      return toSha512(data)
    },
    async randomBytes(size: number) {
      return new Uint8Array(getRandomBytes(size))
    },
  } as const
}
