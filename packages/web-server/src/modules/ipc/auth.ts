import type http from 'node:http'
import querystring from 'node:querystring'

import { IPC_CODE } from '@any-listen/common/constants'

// import { getUserSpace, getUserName, setUserName, createClientKeyInfo } from '@/user'
import { checkClientInfo, createClientInfo, getServerName, getTokenSecret, saveClientInfo, updateLastActive } from '@/shared/data'
import { toSha256 } from '@/shared/utils'

import store from './cache'
import { createToken, getIP, verifyToken } from './tools'

const getAvailableIP = (ip: string) => {
  return ip && (store.get<number>(ip) ?? 0) < 10 ? ip : null
}

const verifyByKey = async (token: string, ip: string, userAgent: string) => {
  const result = await verifyToken(token, getTokenSecret()).catch(() => null)
  if (result && checkClientInfo(result.clientId)) {
    updateLastActive(result.clientId, ip, userAgent)
    return result
  }
  return null
}

const verifyByCode = async (ctx: AnyListen.RequestContext, userPwd: string, pwd: string) => {
  if (userPwd != toSha256(pwd)) return null
  let keyInfo = createClientInfo(ctx)
  const token = await createToken(
    {
      clientId: keyInfo.clientId,
      timestamp: keyInfo.timestamp,
    },
    getTokenSecret()
  )
  saveClientInfo(keyInfo)
  return token
}

export const authCode = async (ctx: AnyListen.RequestContext, pwd: string) => {
  let code = 401
  let msg: string = IPC_CODE.msgAuthFailed

  let ip = getAvailableIP(ctx.userIp)
  if (ip) {
    const key = ctx.headers.m
    if (typeof key == 'string' && key && key.length < 4096) {
      const salt = ctx.headers.s
      let success = false
      if (typeof salt == 'string' && salt && salt.length < 4096) {
        const token = await verifyByCode(ctx, key, pwd + salt)
        if (token != null) {
          ctx.set('token', token)
          success = true
        }
      } else {
        success = (await verifyByKey(key, ip, ctx.headers['user-agent'] ?? '')) != null
      }
      if (success) {
        msg = `${IPC_CODE.helloMsg}\n${encodeURIComponent(getServerName())}`
        code = 200
      }
    }

    if (code != 200) {
      const num = store.get<number>(ip) ?? 0
      // if (num > 20) return
      store.set(ip, num + 1)
    }
  } else {
    code = 403
    msg = IPC_CODE.msgBlockedIp
  }
  // console.log(req.headers)

  ctx.status = code
  ctx.body = msg
}

export const authConnect = async (req: http.IncomingMessage) => {
  let ip: string | null | undefined = getIP(req)
  ip &&= getAvailableIP(ip)
  if (ip) {
    const query = querystring.parse(req.url!.split('?')[1])
    // const i = query.i
    const token = query.m
    if (typeof token == 'string' && token && token.length < 4096) {
      const keyInfo = await verifyByKey(token, ip, req.headers['user-agent'] ?? '')
      if (keyInfo) return keyInfo
    }

    const num = store.get<number>(ip) ?? 0
    store.set(ip, num + 1)
  }
  throw new Error('failed')
}
