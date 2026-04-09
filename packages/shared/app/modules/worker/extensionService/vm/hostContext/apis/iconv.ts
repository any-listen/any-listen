import { utils_iconv_decode, utils_iconv_encode } from '../hostFuncs'

export const createIconv = (extension: AnyListen.Extension.Extension) => {
  return {
    async iconvDecode(data: Uint8Array | Uint16Array, encoding: string) {
      return utils_iconv_decode(data, encoding)
    },
    async iconvEncode(data: string, encoding: string) {
      return utils_iconv_encode(data, encoding)
    },
  } as const
}
