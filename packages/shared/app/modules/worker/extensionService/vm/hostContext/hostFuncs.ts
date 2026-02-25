/* eslint-disable @typescript-eslint/naming-convention */
import crypto from 'node:crypto'

import { logFormat } from '@any-listen/common/tools'
import { dateFormat } from '@any-listen/common/utils'
import { toMD5, toSha256 } from '@any-listen/nodejs'
import iconv from 'iconv-lite'

import { extensionEvent } from '../../event'
import { triggerTimeout } from './preloadFuncs'

enum TIMEOUT_TYPE {
  timeout = 0,
  interval = 1,
}

const timeouts = new Map<number, [string, TIMEOUT_TYPE, NodeJS.Timeout]>()
export const set_timeout = (extId: string, id: number, ms: number) => {
  // console.log('set_timeout', extId, id, ms)
  timeouts.set(id, [
    extId,
    TIMEOUT_TYPE.timeout,
    setTimeout(() => {
      triggerTimeout(extId, id)
      timeouts.delete(id)
    }, ms),
  ])
}

export const clear_timeout = (id: number) => {
  const tiemout = timeouts.get(id)
  if (!tiemout) return
  clearTimeout(tiemout[2])
  timeouts.delete(id)
}

export const set_interval = (extId: string, id: number, ms: number) => {
  timeouts.set(id, [extId, TIMEOUT_TYPE.interval, setInterval(triggerTimeout, ms, extId, id)])
  return id
}

export const clear_interval = (id: number) => {
  const tiemout = timeouts.get(id)
  if (!tiemout) return
  clearInterval(tiemout[2])
  timeouts.delete(id)
}

export const clearExtensionTimeout = (targetExtId: string) => {
  for (const [tid, [extId, type, tiemout]] of timeouts.entries()) {
    if (extId != targetExtId) continue

    if (type == TIMEOUT_TYPE.timeout) clearTimeout(tiemout)
    else clearInterval(tiemout)
    timeouts.delete(tid)
  }
}

export const utils_str2b64 = (data: string) => {
  if (typeof data != 'string') return ''
  try {
    return Buffer.from(data, 'utf-8').toString('base64')
  } catch {
    return ''
  }
}

export const utils_b642buf = (data: string) => {
  if (typeof data != 'string') return []
  try {
    return [...Buffer.from(data, 'base64')]
  } catch {
    return []
  }
}

export const utils_str2md5 = (data: string) => {
  if (typeof data != 'string') return ''
  try {
    return toMD5(data)
  } catch {
    return ''
  }
}

export const utils_str2sha256 = (data: string) => {
  if (typeof data != 'string') return ''
  try {
    return toSha256(data)
  } catch {
    return ''
  }
}

// const verifyParams = (params: Uint8Array | string) => {
//   return typeof params == 'string' || params instanceof Uint8Array
// }
export const AES_MODE = {
  CBC_128_PKCS7Padding: 'aes-128-cbc',
  ECB_128_NoPadding: 'aes-128-ecb',
} as const
export const utils_aes_encrypt = (
  mode: AnyListen.ExtensionVM.AES_MODE,
  data: Uint8Array | string,
  key: Uint8Array | string,
  iv: Uint8Array | string
) => {
  // if (!verifyParams(data) || !verifyParams(key) || !verifyParams(iv)) return ''
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!AES_MODE[mode]) return ''
  try {
    let dataBuf = Buffer.from(data)
    let keyBuf = Buffer.from(key)
    let ivBuf = Buffer.from(iv)
    const cipher = crypto.createCipheriv(AES_MODE[mode], keyBuf, ivBuf)
    const result = Buffer.concat([cipher.update(dataBuf), cipher.final()]).toString('base64')
    return result
  } catch (err) {
    return ''
  }
}

export const RSA_PADDING = {
  RSA_PKCS1_OAEP_PADDING: 'RSA_PKCS1_OAEP_PADDING',
  RSA_NO_PADDING: 'RSA_NO_PADDING',
} as const
export const utils_rsa_encrypt = (
  mode: AnyListen.ExtensionVM.RSA_PADDING,
  data: Uint8Array | string,
  key: Uint8Array | string
) => {
  // if (!verifyParams(data) || !verifyParams(key)) return ''
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!RSA_PADDING[mode]) return ''
  try {
    let dataBuf = Buffer.from(data)
    let keyBuf = Buffer.from(key)
    dataBuf = Buffer.concat([Buffer.alloc(128 - dataBuf.length), dataBuf])
    return crypto.publicEncrypt({ key: keyBuf, padding: crypto.constants[RSA_PADDING[mode]] }, dataBuf).toString('base64')
  } catch {
    return ''
  }
}

export const utils_iconv_decode = (data: Uint8Array | Uint16Array, encoding: string) => {
  return iconv.decode(Buffer.from(data), encoding)
}

export const utils_iconv_encode = (data: string, encoding: string) => {
  return iconv.encode(data, encoding)
}

export const handlePreloadCall = <T extends keyof AnyListen.ExtensionVM.HostCallActions>(
  action: T,
  data: AnyListen.ExtensionVM.HostCallActions[T],
  logcat: (message: string) => void
) => {
  switch (action) {
    case 'logcat': {
      const info = data as AnyListen.ExtensionVM.HostCallActions['logcat']
      if (info.message.length > 50000) {
        info.message = `${info.message.substring(0, 50000)}...`
      }
      if (import.meta.env.DEV) {
        console.log(`[ExtensionHost ${dateFormat(info.timestamp)} ${info.type.toUpperCase()} - ${info.id}] ${info.message}`)
      }
      // console.log(`[ExtensionHost ${dateFormat(info.timestamp)} ${info.type.toUpperCase()} - ${info.id}] ${info.message}`)
      // console.log('logcat', info)
      logcat(logFormat(info))
      extensionEvent.logOutput(info)
      break
    }

    default:
      break
  }
}
