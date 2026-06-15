import { IPC_CODE } from '@any-listen/common/constants'

import { getAuthKey, setAuthKey } from './data'
import { buildIPCUrlPath, buildUrlPath, log, request, toSha256 } from './utils'
import type { KeyInfo, UrlInfo } from './ws'

// const hello = async(urlInfo: UrlInfo) => request(`${urlInfo.httpProtocol}//${urlInfo.hostPath}/${API_PREFIX}/hello`)
//   .then(({ text }) => {
//     if (text == IPC_CODE.helloMsg) return true
//     if (text.startsWith('Hello~::^-^::')) {
//       const verRxp = /v(\d+)/
//       let result = verRxp.exec(text)?.[1]
//       if (result != null) {
//         const servVer = parseInt(result)
//         const localVer = parseInt(verRxp.exec(IPC_CODE.helloMsg)![1])
//         if (servVer > localVer) throw new Error(IPC_CODE.highServiceVersion)
//         else if (servVer < localVer) throw new Error(IPC_CODE.lowServiceVersion)
//       }
//     }
//     return false
//   })
//   .catch((err: any) => {
//     log.error('[auth] hello', err.message)
//     console.log(err)
//     return false
//   })

export const initProxyUrlToken = async (urlInfo: UrlInfo, keyInfo: KeyInfo) => {
  await request(buildUrlPath(urlInfo, `/proxyUrlToken?m=${keyInfo.token}`))
}

const getServerId = async (urlInfo: UrlInfo) =>
  request(buildIPCUrlPath(urlInfo, '/id'))
    .then(({ text }) => {
      if (!text.startsWith(IPC_CODE.idPrefix)) return ''
      return text.replace(IPC_CODE.idPrefix, '')
    })
    .catch((err: Error) => {
      log.error('[auth] getServerId', err.message)
      console.log(err)
      throw err
    })

const codeAuth = async (urlInfo: UrlInfo, serverId: string, authCode: string) => {
  let str = Math.random().toString().substring(2)
  let key = await toSha256(authCode + str)
  // console.log(msg, key)
  return request(buildIPCUrlPath(urlInfo, '/ah'), {
    method: 'post',
    headers: { m: key, s: str },
  }).then(async ({ text, code, headers }) => {
    // console.log(text)
    switch (text) {
      case IPC_CODE.msgBlockedIp:
        throw new Error(IPC_CODE.msgBlockedIp)
      case IPC_CODE.authFailed:
        throw new Error(IPC_CODE.authFailed)
      default:
        if (code != 200) throw new Error(IPC_CODE.authFailed)
    }
    // console.log(msg)
    const [msg, serverName] = text.split('\n')
    if (msg != IPC_CODE.helloMsg || !headers.has('token')) throw new Error(IPC_CODE.authFailed)
    // const info = JSON.parse(text) as KeyInfo
    const keyInfo = { serverId, serverName: decodeURIComponent(serverName), token: headers.get('token')! }
    void setAuthKey(serverId, keyInfo)
    return keyInfo
  })
}

const keyAuth = async (urlInfo: UrlInfo, keyInfo: KeyInfo) => {
  return request(buildIPCUrlPath(urlInfo, '/ah'), {
    method: 'post',
    headers: { m: keyInfo.token },
  }).then(async ({ text, code }) => {
    if (code != 200) throw new Error(IPC_CODE.authFailed)
    const [msg, serverName] = text.split('\n')
    if (msg != IPC_CODE.helloMsg) throw new Error(IPC_CODE.authFailed)
    keyInfo.serverName = decodeURIComponent(serverName)
    void setAuthKey(keyInfo.serverId, keyInfo)
  })
}

const auth = async (urlInfo: UrlInfo, serverId: string, authCode?: string) => {
  if (authCode) return codeAuth(urlInfo, serverId, authCode)
  const keyInfo = await getAuthKey(serverId)
  if (!keyInfo) throw new Error(IPC_CODE.missingAuthCode)
  await keyAuth(urlInfo, keyInfo)
  return keyInfo
}

export default async (urlInfo: UrlInfo, authCode?: string) => {
  console.log('connect: ', urlInfo.href, authCode)
  // console.log(buildIPCUrlPath(urlInfo, '/hello'))
  // if (!await hello(urlInfo)) throw new Error(IPC_CODE.connectServiceFailed)
  const serverId = await getServerId(urlInfo)
  if (!serverId) throw new Error(IPC_CODE.getServiceIdFailed)
  return auth(urlInfo, serverId, authCode)
}
