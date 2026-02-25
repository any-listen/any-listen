// import { MD5 } from 'md5-js-tools'
import { API_PREFIX } from '@any-listen/common/constants'

import type { KeyInfo, UrlInfo } from './ws'
export const request = async (url: string, { timeout = 10000, ...options }: RequestInit & { timeout?: number } = {}) => {
  const controller = new AbortController()
  let id: number | null = setTimeout(() => {
    id = null
    controller.abort()
  }, timeout)
  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .then(async (response) => {
      const text = await response.text()
      return {
        text,
        headers: response.headers,
        code: response.status,
      }
    })
    .catch((err: Error) => {
      // console.log(err, err.code, err.message)
      throw err
    })
    .finally(() => {
      if (id == null) return
      clearTimeout(id)
    })
}

export const encryptMsg = async (keyInfo: KeyInfo, msg: string): Promise<string> => {
  // return msg.length > 1024
  //   ? 'cg_' + await gzipString(msg)
  //   : msg
  // if (!keyInfo) return ''
  // return aesEncrypt(msg, keyInfo.key, keyInfo.iv)
  return msg
}

export const decryptMsg = async (keyInfo: KeyInfo, enMsg: string): Promise<string> => {
  // return enMsg.substring(0, 3) == 'cg_'
  //   ? unGzipString(enMsg.replace('cg_', ''))
  //   : enMsg
  // if (!keyInfo) return ''
  // let msg = ''
  // try {
  //   msg = aesDecrypt(enMsg, keyInfo.key, keyInfo.iv)
  // } catch (err) {
  //   console.log(err)
  // }
  return enMsg
}

// export const toMD5 = (str: string) => {
//   // return MD5.generate(str)
// }
const webSha256 = async (str: string | Uint8Array) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (crypto.subtle == null) throw new Error('crypto.subtle is not available')
  const msgBuffer = typeof str == 'string' ? new TextEncoder().encode(str) : str
  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer as Uint8Array<ArrayBuffer>)
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  // convert bytes to hex string
  const hashHex = hashArray.map((b) => `00${b.toString(16)}`.slice(-2)).join('')
  return hashHex
}
export const toSha256 = async (str: string | Uint8Array) => {
  try {
    return await webSha256(str)
  } catch {}

  const { toSha256 } = await import('@any-listen/web/crypto')
  return toSha256(str)
}

export const parseUrl = (href: string): UrlInfo => {
  // const url = new URL(host)
  // console.log(host)
  // let hostPath = url.host + url.pathname
  // let href = url.href
  if (href.endsWith('/')) href = href.replace(/\/$/, '')
  // if (href.endsWith('/')) href = href.replace(/\/$/, '')
  const httpProtocol = href.startsWith('https:') ? 'https:' : 'http:'

  console.log({
    wsProtocol: httpProtocol == 'https:' ? 'wss:' : 'ws:',
    httpProtocol,
    hostPath: href.replace(`${httpProtocol}//`, ''),
    href,
  })

  return {
    wsProtocol: httpProtocol == 'https:' ? 'wss:' : 'ws:',
    httpProtocol,
    hostPath: href.replace(`${httpProtocol}//`, ''),
    href,
  }
}

export const log = console

export const buildUrlPath = (urlInfo: UrlInfo, path: string, isWS = false) => {
  return `${isWS ? urlInfo.wsProtocol : urlInfo.httpProtocol}//${urlInfo.hostPath}${API_PREFIX}/ipc${path}`
}
