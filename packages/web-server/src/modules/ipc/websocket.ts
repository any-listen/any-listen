import type { IncomingMessage } from 'node:http'
import type { Socket } from 'node:net'

import { IPC_CLOSE_CODE } from '@any-listen/common/constants'
import type WS from 'ws'
import { WebSocketServer } from 'ws'

import { removeClientInfo } from '@/shared/data'
import { appLog } from '@/shared/log4js'

import { authConnect } from './auth'
import { socketEvent } from './event'
import { decryptMsg, encryptMsg } from './tools'

export interface KeyInfo {
  clientId: string
  timestamp: number
  // deviceName: string
  // lastConnectDate?: number
  // isMobile: boolean
}
export interface Status {
  status: boolean
  message: string
  address: string[]
  // code: string
  devices: KeyInfo[]
}
interface ServerSocketBase extends WS.WebSocket {
  aliveTime: number
  isReady: boolean
  isInited: boolean
  keyInfo: KeyInfo

  sendMessage: (message: unknown) => void
  onMessage?: (message: string) => void
  onClose: (handler: (err: Error) => void | Promise<void>) => () => void
  broadcast: (handler: (client: ServerSocket) => void) => void

  // remote: AnyListen.IPC.ServerCommonActions
  // remoteQueueList: AnyListen.IPC.ServerListActions
  // remoteQueueDislike: AnyListen.IPC.ServerDislikeActions
}
export interface ServerSocketWinMain extends ServerSocketBase {
  winType: 'main'
  remote: AnyListen.IPC.ClientICPCommonActions
  remoteQueueTheme: AnyListen.IPCTheme.ClientIPCActions
  remoteQueuePlayer: AnyListen.IPCPlayer.ClientIPCActions
  remoteQueueList: AnyListen.IPCList.ClientIPCActions
  remoteQueueDislike: AnyListen.IPCDislikeList.ClientIPCActions
  remoteQueueExtension: AnyListen.IPCExtension.ClientIPCActions
  remoteExtension: AnyListen.IPCExtension.ClientIPCActions
}
export type ServerSocket = ServerSocketWinMain

type SocketServer = WS.Server<ServerSocket>
let host = 'http://localhost'

let wss: SocketServer = new WebSocketServer({ noServer: true })

// const checkDuplicateClient = (newSocket: ServerSocket) => {
//   for (const client of [...wss!.clients]) {
//     if (client === newSocket || client.keyInfo.clientId != newSocket.keyInfo.clientId) continue
//     appLog.info('duplicate client', client.keyInfo.clientId)
//     client.isReady = false
//     client.close(IPC_CLOSE_CODE.normal)
//   }
// }

const winTypes: AnyListen.IPC.WinType[] = ['main'] as const
const handleConnection = async (socket: ServerSocket, request: IncomingMessage) => {
  const queryData = new URL(request.url!, host).searchParams
  const winType = queryData.get('t') as AnyListen.IPC.WinType | null
  if (!winType || !winTypes.includes(winType)) {
    socket.close(IPC_CLOSE_CODE.failed)
    return
  }
  socket.winType = winType

  //   // if (typeof socket.handshake.query.i != 'string') return socket.disconnect(true)
  // const userSpace = getUserSpace()
  // const keyInfo = userSpace.dataManage.getClientKeyInfo(clientId)
  // if (!keyInfo) {
  //   socket.close(IPC_CLOSE_CODE.failed)
  //   return
  // }
  // keyInfo.lastConnectDate = Date.now()
  // userSpace.dataManage.saveClientKeyInfo(keyInfo)
  //   // socket.lx_keyInfo = keyInfo
  // socket.keyInfo = keyInfo
  // socket.userInfo = { name: 'default' }

  // checkDuplicateClient(socket)

  // try {
  //   await sync(socket)
  // } catch (err) {
  //   // console.log(err)
  //   log.warn(err)
  //   return
  // }
  // status.devices.push(keyInfo)
  // handleConnection(io, socket)
  // sendServerStatus(status)
  // socket.onClose(() => {
  //   status.devices.splice(status.devices.findIndex(k => k.clientId == keyInfo.clientId), 1)
  //   sendServerStatus(status)
  // })

  // console.log('connection', keyInfo.deviceName)
  // log.info('connection', keyInfo.deviceName)
  // console.log(socket.handshake.query)
  socket.isInited = false
  socketEvent.new_socket(socket)
  socket.isReady = true
}
function noop() {}

wss.on('connection', (socket, request) => {
  socket.isReady = false
  socket.aliveTime = performance.now()
  socket.on('pong', () => {
    socket.aliveTime = performance.now()
  })

  let closeEvents: Array<(err: Error) => void | Promise<void>> = []
  let disconnected = false

  socket.addEventListener('message', ({ data }) => {
    if (typeof data != 'string') return
    socket.aliveTime = performance.now()
    void decryptMsg(socket.keyInfo, data)
      .then((data) => {
        let syncData: unknown
        try {
          syncData = JSON.parse(data)
        } catch (err) {
          appLog.error('parse message error:', err)
          socket.close(IPC_CLOSE_CODE.failed)
          return
        }
        // socketEvent.message(socket, syncData)
        socket.onMessage?.(syncData as string)
        // msg2call.message(syncData)
      })
      .catch((err: Error) => {
        appLog.error('decrypt message error:', err)
        appLog.error(err.message)
        socket.close(IPC_CLOSE_CODE.failed)
      })
  })
  socket.addEventListener('close', (event) => {
    if (event.code == IPC_CLOSE_CODE.logout) {
      socketEvent.remove_session(socket.keyInfo.clientId)
    }
    const err = new Error('closed')
    try {
      for (const handler of closeEvents) void handler(err)
    } catch (err) {
      appLog.error((err as Error | null)?.message)
    }
    closeEvents = []
    disconnected = true
    // msg2call.destroy()
    if (socket.isReady) {
      // appLog.info('deconnection', socket.userInfo.name, socket.keyInfo.deviceName)
      // events = {}
      // if (!status.devices.map(d => getUserName(d.clientId)).filter(n => n == socket.userInfo.name).length) handleUnconnection(socket.userInfo.name)
    } else {
      // const queryData = new URL(request.url!, host).searchParams
      // appLog.info('deconnection', queryData.get('i'))
    }
  })
  socket.sendMessage = function (message) {
    if (disconnected) throw new Error('disconnected')
    void encryptMsg(socket.keyInfo, JSON.stringify(message))
      .then((data) => {
        // console.log('sendData', eventName)
        socket.send(data)
      })
      .catch((err: Error) => {
        appLog.error('encrypt message error:', err)
        appLog.error(err.message)
        socket.close(IPC_CLOSE_CODE.failed)
      })
  }
  socket.onClose = function (handler: (typeof closeEvents)[number]) {
    closeEvents.push(handler)
    return () => {
      closeEvents.splice(closeEvents.indexOf(handler), 1)
    }
  }
  socket.broadcast = function (handler) {
    for (const client of wss.clients) handler(client)
  }

  void handleConnection(socket, request)
})

socketEvent.on('remove_session', (id) => {
  removeClientInfo(id)
  const socket = Array.from(wss.clients).find((s) => s.keyInfo.clientId == id)
  if (!socket || socket.readyState == socket.CLOSED) return
  socket.close(IPC_CLOSE_CODE.logout)
})

const interval = setInterval(() => {
  const now = performance.now()
  wss.clients.forEach((socket) => {
    const diff = now - socket.aliveTime
    if (diff > 45_000) {
      // appLog.info('alive check false:', socket.userInfo.name, socket.keyInfo.deviceName)
      appLog.info('alive check false')
      socket.terminate()
      return
    }

    if (diff > 15_000) {
      socket.ping(noop)
      socket.send('ping', noop)
    }
  })
}, 30_000)

wss.on('close', () => {
  clearInterval(interval)
})

const authConnection = (req: IncomingMessage, callback: (err: Error | null, keyInfo: KeyInfo | null) => void) => {
  // console.log(req.headers)
  // // console.log(req.auth)
  // console.log(req._query.authCode)
  authConnect(req)
    .then((keyInfo) => {
      callback(null, keyInfo)
    })
    .catch((err: Error) => {
      callback(err, null)
    })
}
function onSocketError(err: Error) {
  console.error(err)
}

export const onUpgrade = (request: IncomingMessage, socket: Socket, head: Buffer) => {
  socket.addListener('error', onSocketError)
  // This function is not defined on purpose. Implement it with your own logic.
  authConnection(request, (err, keyInfo) => {
    if (err) {
      // console.log(err)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }
    socket.removeListener('error', onSocketError)

    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.keyInfo = keyInfo!
      wss.emit('connection', ws, request)
    })
  })
}

export const broadcast = (handler: (client: ServerSocket) => void) => {
  for (const client of wss.clients) handler(client)
}

export const getSockets = () => {
  return Array.from(wss.clients.values())
}

export const destroySockets = () => {
  for (const client of wss.clients) client.close(IPC_CLOSE_CODE.normal)
}
