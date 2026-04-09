import { toMD5, toSha1, toSha256, toSha512 } from '@any-listen/nodejs'

import { utils_aes_encrypt, utils_rsa_encrypt } from '../hostFuncs'

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
    async rsaEncrypt(mode: AnyListen.ExtensionVM.RSA_PADDING, data: Uint8Array | string, key: Uint8Array | string) {
      return utils_rsa_encrypt(mode, data, key)
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
  } as const
}
