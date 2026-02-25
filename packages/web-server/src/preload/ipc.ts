import { IPC_CODE } from '@any-listen/common/constants'

import handleAuth from './auth'
import { log, parseUrl } from './utils'
import type { IPCSocket } from './ws'
import { sendSyncMessage, sendSyncStatus, connect as socketConnect, disconnect as socketDisconnect } from './ws'
import { wsEvent } from './wsEvent'

let connectId = 0

const disconnectServer = async (isResetStatus = true) =>
  handleDisconnect()
    .then(() => {
      log.info('disconnect...')
      if (isResetStatus) {
        connectId++
        sendSyncStatus({
          status: false,
          message: '',
        })
      }
    })
    .catch((err: Error) => {
      log.error(`disconnect error: ${err.message}`)
      sendSyncMessage(err.message)
    })

const handleConnect = async (
  exposeObj: AnyListen.IPC.ClientIPCActions<IPCSocket>,
  host: string,
  authCode: string,
  winType: AnyListen.IPC.WinType
) => {
  // const hostInfo = await getSyncHost()
  // console.log(hostInfo)
  // if (!hostInfo || !hostInfo.host || !hostInfo.port) throw new Error(SYNC_CODE.unknownServiceAddress)
  const id = connectId
  const urlInfo = parseUrl(host)
  await disconnectServer(false)
  if (id != connectId) return null
  const keyInfo = await handleAuth(urlInfo, authCode)
  if (id != connectId) return null
  await socketConnect(exposeObj, urlInfo, keyInfo, winType)
}
const handleDisconnect = async () => {
  await socketDisconnect()
}

const connect = async (
  exposeObj: AnyListen.IPC.ClientIPCActions<IPCSocket>,
  host: string,
  authCode: string,
  winType: AnyListen.IPC.WinType,
  onFailed: (message: string) => void
) => {
  const result = await handleConnect(exposeObj, host, authCode, winType).catch((err: Error) => {
    console.log(err)
    switch (err.message) {
      case IPC_CODE.missingAuthCode:
      case IPC_CODE.authFailed:
      case IPC_CODE.abnormalDisconnection:
      case IPC_CODE.msgBlockedIp:
        onFailed(err.message)
        return false
    }
    return null
  })
  if (result === false) return false
  if (result === null) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    void connect(exposeObj, host, authCode, winType, onFailed)
  }
}

let events = {
  connected: (socket: IPCSocket) => {},
  disconnected: () => {},
  logout: () => {},
}
wsEvent.on('connected', (socket) => {
  events.connected(socket)
})
wsEvent.on('disconnected', () => {
  events.disconnected()
})
wsEvent.on('logout', () => {
  events.logout()
})
export const createIPC = ({
  exposeObj,
  host,
  authCode,
  winType,
  onConnected,
  onDisconnected,
  onFailed,
  onLogout,
}: {
  exposeObj: AnyListen.IPC.ClientIPCActions<IPCSocket>
  host: string
  authCode: string
  winType: AnyListen.IPC.WinType
  onConnected: (socket: IPCSocket) => void
  onDisconnected: () => void
  onFailed: (message: string) => void
  onLogout: () => void
}) => {
  events.connected = onConnected
  events.disconnected = onDisconnected
  events.logout = onLogout
  void connect(exposeObj, host, authCode, winType, onFailed)
}
