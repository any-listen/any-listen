import { hostContext } from '@/host/state'

// const dataToB64 = (data) => {
//   if (typeof data === 'string') return nativeFuncs.utils_str2b64(data)
//   else if (Array.isArray(data) || ArrayBuffer.isView(data)) return utils.buffer.bufToString(data, 'base64')
//   throw new Error('data type error: ' + typeof data + ' raw data: ' + data)
// }

export const iconv: AnyListen_API.Iconv = {
  decode(data: Uint8Array | Uint16Array, encoding: string) {
    return hostContext.utils_iconv_decode(data, encoding)
  },
  encode(data: string, encoding: string) {
    return hostContext.utils_iconv_encode(data, encoding)
  },
}
