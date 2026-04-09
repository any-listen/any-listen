/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
import { hostContext } from '@/host/state'

// from(input: string | Uint8Array, encoding: AnyListen_API.BufferFormat = 'utf-8') {
//   // console.log('buffer.from', input, encoding)
//   if (typeof input === 'string') {
//     switch (encoding) {
//       case 'binary':
//         throw new Error('Binary encoding is not supported for input strings')
//       case 'base64':
//         return new Uint8Array(hostContext.utils_b642buf(input))
//       case 'hex':
//         return new Uint8Array((input.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)))
//       default:
//         return new Uint8Array(hostContext.utils_str2buf(input))
//     }
//   } else if (Array.isArray(input)) {
//     return new Uint8Array(input)
//   } else {
//     throw new Error(`Unsupported input type: ${typeof input} encoding: ${encoding}`)
//   }
// },
// bufToString<T extends AnyListen_API.BufferFormat>(buf: Uint8Array, format: T): AnyListen_API.BufferToStringTypes[T] {
//   if (Array.isArray(buf) || ArrayBuffer.isView(buf)) {
//     switch (format) {
//       case 'binary':
//         // return new TextDecoder('latin1').decode(new Uint8Array(buf))
//         return buf as AnyListen_API.BufferToStringTypes[T]
//       case 'hex':
//         return new Uint8Array(buf).reduce(
//           (str, byte) => str + byte.toString(16).padStart(2, '0'),
//           ''
//         ) as unknown as AnyListen_API.BufferToStringTypes[T]
//       case 'base64':
//         // TODO add to base64 api
//         return hostContext.utils_str2b64(hostContext.utils_buf2str(buf)) as AnyListen_API.BufferToStringTypes[T]
//       case 'utf8':
//       case 'utf-8':
//       default:
//         return hostContext.utils_buf2str(buf) as AnyListen_API.BufferToStringTypes[T]
//     }
//   } else {
//     throw new Error(`Input is not a valid buffer: ${String(buf)} format: ${format}`)
//   }
// },

const availableFromFormats: AnyListen_API.ConverterFormatFrom[] = ['base64', 'hex', 'utf-8']
const availableToFormats: AnyListen_API.ConverterFormatTo[] = ['binary', 'base64', 'hex', 'utf-8']
const availableBinaryToFormats: AnyListen_API.ConverterBinaryFormatTo[] = ['base64', 'hex', 'utf-8']

export const dataConverter = (async (
  input: string | Uint8Array,
  format: AnyListen_API.ConverterFormatFrom = 'utf-8',
  toFormat: AnyListen_API.ConverterFormatTo = 'binary'
) => {
  if (typeof input == 'string') {
    if (!availableFromFormats.includes(format)) {
      throw new Error(`Unsupported input format: ${format}`)
    }
    if (!availableToFormats.includes(toFormat)) {
      throw new Error(`Unsupported output format: ${toFormat}`)
    }
    return hostContext.hostFuncs.dataConverterString(input, format, toFormat || 'binary')
  }
  input = new Uint8Array(input)

  if (!availableBinaryToFormats.includes(format)) {
    throw new Error(`Unsupported output format: ${toFormat}`)
  }
  return hostContext.hostFuncs.dataConverterBinary(input, format)
}) as AnyListen_API.API['utils']['dataConverter']
