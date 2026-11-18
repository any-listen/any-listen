import { randomBytes, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { throttle } from '@any-listen/common/utils'
import { toSha512 } from '@any-listen/nodejs'

import { File } from '@/shared/constants'

import { startupLog } from './log4js'

interface ServerInfo {
  serverId: string
  tokenSecret: string
  version: number
}
let serverInfoFilePath: string
let clientInfoFilePath: string
let serverInfo: ServerInfo
const saveServerInfoThrottle = throttle(() => {
  fs.writeFile(serverInfoFilePath, JSON.stringify(serverInfo), 'utf8', (err) => {
    if (err) console.error(err)
  })
})
const initServerInfo = () => {
  serverInfo = {
    serverId: randomUUID(),
    tokenSecret: toSha512(randomBytes(128)),
    version: 1,
  }
  saveServerInfoThrottle()
}
export const initServerData = () => {
  serverInfoFilePath = path.join(global.anylisten.dataPath, File.serverInfoJSON)
  clientInfoFilePath = path.join(global.anylisten.dataPath, File.clientInfoJSON)
  if (fs.existsSync(serverInfoFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(serverInfoFilePath).toString()) as ServerInfo | null
      if (!data || typeof data != 'object') throw new Error('invalid content')
      serverInfo = data
    } catch (err) {
      startupLog.error(`failed to load server info (${serverInfoFilePath}), regenerating:`, err)
      fs.renameSync(serverInfoFilePath, `${serverInfoFilePath}.${Date.now()}.bak`)
      initServerInfo()
    }
  } else initServerInfo()
  if (fs.existsSync(clientInfoFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(clientInfoFilePath).toString()) as ClientInfo[]
      if (!Array.isArray(data)) throw new Error('invalid content')
      clientInfos = data
    } catch (err) {
      startupLog.error(`failed to load client info (${clientInfoFilePath}), resetting:`, err)
      fs.renameSync(clientInfoFilePath, `${clientInfoFilePath}.${Date.now()}.bak`)
      clientInfos = []
      saveClientInfoThrottle()
    }
  } else {
    clientInfos = []
    saveClientInfoThrottle()
  }
}

export const getServerId = (): string => {
  return serverInfo.serverId
}

export const getServerName = (): string => {
  return global.anylisten.config.serverName
}
export const getTokenSecret = (): string => {
  return serverInfo.tokenSecret
}
export const getVersion = () => {
  return serverInfo.version
}
export const setVersion = (version: number) => {
  serverInfo.version = version
  saveServerInfoThrottle()
}

export const getLoginPassword = () => {
  return global.anylisten.config.password
}

type ClientInfo = AnyListen.LoginDevice
let clientInfos: ClientInfo[]
const saveClientInfoThrottle = throttle(() => {
  fs.writeFile(clientInfoFilePath, JSON.stringify(clientInfos), 'utf8', (err) => {
    if (err) console.error(err)
  })
})
export const createClientInfo = (ctx: AnyListen.RequestContext): ClientInfo => {
  return {
    clientId: randomUUID(),
    timestamp: Date.now(),
    lastActive: Date.now(),
    userAgent: ctx.headers['user-agent'] ?? '',
    ip: ctx.userIp,
  }
}
export const saveClientInfo = (info: ClientInfo) => {
  clientInfos.push(info)
  saveClientInfoThrottle()
}
export const updateLastActive = (id: string, ip: string, userAgent: string) => {
  const target = clientInfos.find((info) => info.clientId == id)
  if (!target) return
  target.lastActive = Date.now()
  target.ip = ip
  target.userAgent = userAgent
  saveClientInfoThrottle()
}

export const getClientInfos = () => {
  return clientInfos
}
export const removeClientInfo = (id: string) => {
  const idx = clientInfos.findIndex((info) => info.clientId == id)
  if (idx != -1) {
    clientInfos.splice(idx, 1)
    saveClientInfoThrottle()
  }
}
export const checkClientInfo = (id: string) => {
  return clientInfos.some((info) => info.clientId == id)
}
