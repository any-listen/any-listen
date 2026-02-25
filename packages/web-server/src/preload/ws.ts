import { IPC_CLOSE_CODE, IPC_CODE } from '@any-listen/common/constants'
import { dateFormat } from '@any-listen/common/utils'
import { createMessage2Call } from 'message2call'

import handleAuth from './auth'
import { removeAuthKey } from './data'
import { buildUrlPath, decryptMsg, encryptMsg, log } from './utils'
import { wsEvent } from './wsEvent'

export interface KeyInfo {
  serverId: string
  // clientId: string
  token: string
  serverName: string
}
export interface UrlInfo {
  wsProtocol: string
  httpProtocol: string
  hostPath: string
  href: string
}
export interface Status {
  status: boolean
  message: string
}
export interface IPCSocket extends WebSocket {
  isReady: boolean
  data: {
    keyInfo: KeyInfo
    urlInfo: UrlInfo
    winType: AnyListen.IPC.WinType
  }
  // moduleReadys: {
  //   list: boolean
  //   dislike: boolean
  // }

  onClose: (handler: (err: Error) => void | Promise<void>) => () => void
  logout: () => Promise<void>

  remote: AnyListen.IPC.ServerCommonActions
  remoteQueueTheme: AnyListen.IPCTheme.ServerIPCActions
  remoteQueuePlayer: AnyListen.IPCPlayer.ServerIPCActions
  remoteQueueList: AnyListen.IPCList.ServerIPCActions
  remoteQueueDislike: AnyListen.IPCDislikeList.ServerIPCActions
  remoteQueueExtension: AnyListen.IPCExtension.ServerIPCActions
  remoteExtension: AnyListen.IPCExtension.ServerIPCActions
}

let client: IPCSocket | null

let status: Status = {
  status: false,
  message: '',
}

export const sendSyncStatus = (newStatus: Status) => {
  status.status = newStatus.status
  status.message = newStatus.message
  // setSyncStatus(status)
  console.log('ipc socket status:', status)
}

export const sendSyncMessage = (message: string) => {
  status.message = message
  // setSyncStatus(status)
  console.log('ipc socket message:', message)
}

const heartbeatTools = {
  failedNum: 0,
  maxTryNum: 100000,
  stepMs: 3000,
  connectTimeout: null as number | null,
  pingTimeout: null as number | null,
  delayRetryTimeout: null as number | null,
  exposeObj: null as AnyListen.IPC.ClientICPCommonActions<IPCSocket> | null,
  socket: null as IPCSocket | null,
  isError: false,
  heartbeat() {
    if (this.pingTimeout) clearTimeout(this.pingTimeout)

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this.pingTimeout = setTimeout(() => {
      client?.close()
    }, 46_000)
  },
  async reConnnect() {
    this.clearTimeout()
    // client = null
    if (!client) return

    if (++this.failedNum > this.maxTryNum) {
      this.failedNum = 0
      sendSyncStatus({
        status: false,
        message: 'Connect error',
      })
      throw new Error('connect error')
    }

    if (this.isError) {
      await handleAuth(client.data.urlInfo).catch((err: Error) => {
        console.log(err)
        if (err.message == IPC_CODE.msgAuthFailed) {
          wsEvent.logout()
          throw err
        }
      })
    }

    const waitTime = Math.min(2000 + Math.floor(this.failedNum / 2) * this.stepMs, 60000)

    // sendSyncStatus({
    //   status: false,
    //   message: `Waiting ${waitTime / 1000}s reconnnect...`,
    // })

    this.delayRetryTimeout = setTimeout(() => {
      this.delayRetryTimeout = null
      if (!client) return
      console.log(dateFormat(new Date()), 'reconnnect...')
      sendSyncStatus({
        status: false,
        message: `Try reconnnect... (${this.failedNum})`,
      })
      void connect(this.exposeObj!, client.data.urlInfo, client.data.keyInfo, client.data.winType)
    }, waitTime)
  },
  clearTimeout() {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout)
      this.connectTimeout = null
    }
    if (this.delayRetryTimeout) {
      clearTimeout(this.delayRetryTimeout)
      this.delayRetryTimeout = null
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
  },
  handleOpen() {
    if (heartbeatTools.connectTimeout) {
      clearTimeout(heartbeatTools.connectTimeout)
      heartbeatTools.connectTimeout = null
    }
    console.log('open')
    // heartbeatTools.failedNum = 0
    heartbeatTools.heartbeat()
  },
  handleMessage({ data }: MessageEvent<unknown>) {
    // if (data == 'ping') heartbeatTools.heartbeat()
    heartbeatTools.heartbeat()
  },
  handleClose(event: CloseEvent) {
    console.log(event.code)
    switch (event.code) {
      case IPC_CLOSE_CODE.normal:
      case IPC_CLOSE_CODE.failed:
      case IPC_CLOSE_CODE.logout:
        return
    }
    void heartbeatTools.reConnnect()
  },
  handleError() {
    heartbeatTools.isError = true
  },
  connect(socket: IPCSocket, exposeObj: AnyListen.IPC.ClientICPCommonActions<IPCSocket>) {
    console.log('heartbeatTools connect')
    this.disconnect()
    this.exposeObj = exposeObj
    this.connectTimeout = setTimeout(
      () => {
        this.connectTimeout = null
        if (client) {
          try {
            client.close(IPC_CLOSE_CODE.failed)
          } catch {}
        }
        if (++this.failedNum > this.maxTryNum) {
          this.failedNum = 0
          sendSyncStatus({
            status: false,
            message: 'Connect error',
          })
          throw new Error('connect error')
        }
        sendSyncStatus({
          status: false,
          message: 'Connect timeout, try reconnect...',
        })
        void this.reConnnect()
      },
      2 * 60 * 1000
    )
    // eslint-disable-next-line @typescript-eslint/unbound-method
    socket.addEventListener('open', this.handleOpen)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    socket.addEventListener('message', this.handleMessage)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    socket.addEventListener('close', this.handleClose)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    socket.addEventListener('error', this.handleError)
    this.socket = socket
  },
  disconnect() {
    this.clearTimeout()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.socket?.removeEventListener('open', this.handleOpen)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.socket?.removeEventListener('message', this.handleMessage)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.socket?.removeEventListener('close', this.handleClose)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.socket?.addEventListener('error', this.handleError)
    this.socket = null
    this.isError = false
  },
}

// let listSyncPromise: Promise<void>
export const connect = async (
  exposeObj: AnyListen.IPC.ClientICPCommonActions<IPCSocket>,
  urlInfo: UrlInfo,
  keyInfo: KeyInfo,
  winType: AnyListen.IPC.WinType
) => {
  let pending = true
  return new Promise<void>((resolve, reject) => {
    client = new WebSocket(
      buildUrlPath(urlInfo, `/socket?m=${encodeURIComponent(keyInfo.token)}&t=${winType}`, true)
    ) as IPCSocket
    client.data = {
      keyInfo,
      urlInfo,
      winType,
    }

    let closeEvents: Array<(err: Error) => void | Promise<void>> = []
    let disconnected = true

    const message2read = createMessage2Call<AnyListen.IPC.ServerCommonActions>({
      exposeObj,
      timeout: 0,
      isSendErrorStack: true,
      sendMessage(data) {
        if (disconnected) throw new Error('disconnected')
        void encryptMsg(keyInfo, JSON.stringify(data))
          .then((data) => {
            client?.send(data)
          })
          .catch((err) => {
            log.error('encrypt msg error: ', err)
            client?.close(IPC_CLOSE_CODE.failed)
          })
      },
      onCallBeforeParams(rawArgs) {
        return [client, ...rawArgs]
      },
      onError(error, path, groupName) {
        const name = groupName ?? ''
        log.error(`call ${name} ${path.join('.')} error:`, error)
        // if (groupName == null) return
        // client?.close(IPC_CLOSE_CODE.failed)
        // sendSyncStatus({
        //   status: false,
        //   message: error.message,
        // })
      },
    })

    client.remote = message2read.remote
    client.remoteQueueTheme = message2read.createRemoteGroup('theme', { queue: true, timeout: 0 })
    client.remoteQueuePlayer = message2read.createRemoteGroup('player', { queue: true, timeout: 0 })
    client.remoteQueueList = message2read.createRemoteGroup('list', { queue: true, timeout: 0 })
    client.remoteQueueDislike = message2read.createRemoteGroup('dislike', { queue: true, timeout: 0 })
    client.remoteQueueExtension = message2read.createRemoteGroup('extension', { queue: true, timeout: 0 })
    client.remoteExtension = message2read.createRemoteGroup('extension', { timeout: 60_000 })

    client.addEventListener('message', ({ data }) => {
      if (data == 'ping') return
      if (typeof data === 'string') {
        void decryptMsg(keyInfo, data)
          .then((data) => {
            let syncData: unknown
            try {
              syncData = JSON.parse(data)
            } catch (err) {
              log.error('parse msg error: ', err)
              client?.close(IPC_CLOSE_CODE.failed)
              return
            }
            message2read.message(syncData)
          })
          .catch((error) => {
            log.error('decrypt msg error: ', error)
            client?.close(IPC_CLOSE_CODE.failed)
          })
      }
    })
    client.onClose = function (handler: (typeof closeEvents)[number]) {
      closeEvents.push(handler)
      return () => {
        closeEvents.splice(closeEvents.indexOf(handler), 1)
      }
    }
    client.logout = async function () {
      heartbeatTools.disconnect()
      await removeAuthKey(keyInfo.serverId)
      client?.close(IPC_CLOSE_CODE.logout)
      // wsEvent.logout()
    }

    const initMessage = 'Wait syncing...'
    client.addEventListener('open', () => {
      pending = false
      resolve()
      log.info('connect')
      // const store = getStore()
      // global.lxKeyInfo = keyInfo
      client!.isReady = false
      // client!.moduleReadys = {
      //   list: false,
      //   dislike: false,
      // }
      disconnected = false
      wsEvent.connected(client!)
      // sendSyncStatus({
      //   status: false,
      //   message: initMessage,
      // })
    })
    client.addEventListener('close', ({ code }) => {
      const err = new Error('closed')
      try {
        for (const handler of closeEvents) void handler(err)
      } catch (err) {
        log.error((err as Error | null)?.message)
      }
      closeEvents = []
      disconnected = true
      message2read.destroy()
      switch (code) {
        case IPC_CLOSE_CODE.normal:
          // case IPC_CLOSE_CODE.failed:
          sendSyncStatus({
            status: false,
            message: '',
          })
          break
        case IPC_CLOSE_CODE.failed:
          if (!status.message || status.message == initMessage) {
            sendSyncStatus({
              status: false,
              message: 'Failed',
            })
          }
          break
        case IPC_CLOSE_CODE.logout:
          void removeAuthKey(keyInfo.serverId)
          wsEvent.logout()
          sendSyncStatus({
            status: false,
            message: 'Logout',
          })
          break
        case 1006:
          sendSyncStatus({
            status: false,
            message: 'Abnormal disconnection',
          })
          if (pending) {
            reject(new Error(IPC_CODE.abnormalDisconnection))
            pending = false
            client = null
            heartbeatTools.disconnect()
          }
          break
      }
      wsEvent.disconnected()
      console.log('closed')
    })
    client.addEventListener('error', (event) => {
      console.error(event)
    })

    heartbeatTools.connect(client, exposeObj)
  })
}

export const disconnect = async () => {
  if (!client) return
  log.info('disconnecting...')
  client.close(IPC_CLOSE_CODE.normal)
  client = null
  heartbeatTools.clearTimeout()
  heartbeatTools.failedNum = 0
}
