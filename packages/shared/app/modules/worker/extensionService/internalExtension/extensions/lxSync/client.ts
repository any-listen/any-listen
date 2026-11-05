import WebSocket from 'ws'
import type { RawData } from 'ws'

import type { ClientKeyInfo, ServerUrlInfo } from './protocol/auth'
import { buildSocketUrl } from './protocol/auth'
import { decryptMsg, encryptMsg } from './protocol/crypto'
import { Msg2Call } from './protocol/msg2call'
import type { LxDislikeAction, LxDislikeRules, LxEnabledFeatures, LxListAction, LxListData, LxSyncMode } from './protocol/types'

export type SyncClientStatus = 'idle' | 'connecting' | 'connected' | 'syncing' | 'disconnected' | 'error'

export interface SyncClientStatusInfo {
  status: SyncClientStatus
  message?: string
}

export interface SyncClientHandlers {
  /** Negotiate which features this client supports */
  getEnabledFeatures: (serverType: string, supportedFeatures: Record<string, number>) => LxEnabledFeatures | false
  getListData: () => Promise<LxListData>
  setListData: (data: LxListData) => Promise<void>
  getListMd5: () => Promise<string>
  getSyncMode: () => Promise<LxSyncMode>
  listFinished: () => Promise<void>
  onListAction: (action: LxListAction) => Promise<void>

  getDislikeData: () => Promise<LxDislikeRules>
  setDislikeData: (rules: LxDislikeRules) => Promise<void>
  getDislikeMd5: () => Promise<string>
  dislikeFinished: () => Promise<void>
  onDislikeAction: (action: LxDislikeAction) => Promise<void>

  finished: () => Promise<void>
  onStatusChange?: (info: SyncClientStatusInfo) => void
  onError?: (error: Error) => void
}

export interface SyncClientOptions {
  url: ServerUrlInfo
  keyInfo: ClientKeyInfo
  handlers: SyncClientHandlers
  /** Enable the dislike list sync feature */
  enableDislike?: boolean
}

const HEARTBEAT_TIMEOUT = 31_000
const MAX_RECONNECT_DELAY = 15_000
const MIN_RECONNECT_DELAY = 2_000

/** The remote functions exposed by the sync server, accessed through a proxy */
type RemoteActions = Record<string, (...args: unknown[]) => Promise<unknown>>

/** Normalize the raw ws message payload to a string */
const toText = (data: RawData): string => {
  if (Array.isArray(data)) return Buffer.concat(data).toString()
  if (Buffer.isBuffer(data)) return data.toString()
  return Buffer.from(data).toString()
}

export class LxSyncClient {
  readonly #url: ServerUrlInfo
  readonly #keyInfo: ClientKeyInfo
  readonly #handlers: SyncClientHandlers
  readonly #enableDislike: boolean

  #ws: WebSocket | undefined
  #msg2call: Msg2Call<RemoteActions> | undefined
  #listRemote: RemoteActions | undefined
  #dislikeRemote: RemoteActions | undefined
  #status: SyncClientStatus = 'idle'
  #stoped = false
  #failedNum = 0
  #heartbeatTimer: ReturnType<typeof setTimeout> | undefined
  #reconnectTimer: ReturnType<typeof setTimeout> | undefined

  constructor(options: SyncClientOptions) {
    this.#url = options.url
    this.#keyInfo = options.keyInfo
    this.#handlers = options.handlers
    this.#enableDislike = options.enableDislike ?? true
  }

  get status() {
    return this.#status
  }

  get keyInfo() {
    return this.#keyInfo
  }

  connect() {
    if (this.#stoped) return
    this.#cleanupSocket()
    this.#setStatus('connecting')
    let socket: WebSocket
    try {
      socket = new WebSocket(buildSocketUrl(this.#url, this.#keyInfo), {
        handshakeTimeout: 15_000,
      })
    } catch (error) {
      this.#handleSocketError(error as Error)
      return
    }
    this.#ws = socket
    const msg2call = new Msg2Call<RemoteActions>({
      // the concrete handlers are typed by the sync protocol interfaces
      funcsObj: this.#buildFuncsObject() as unknown as RemoteActions,
      sendMessage: (data) => {
        const socket = this.#ws
        // Keep this check synchronous so Msg2Call can reject the pending call
        if (socket?.readyState != WebSocket.OPEN) throw new Error('Websocket is not connected')
        void encryptMsg(data)
          .then((msg) => {
            socket.send(msg)
          })
          .catch((error: unknown) => {
            this.#handlers.onError?.(error as Error)
          })
      },
      onError: (error) => {
        this.#handlers.onError?.(error)
      },
    })
    this.#msg2call = msg2call
    this.#listRemote = msg2call.createQueueRemote('list')
    this.#dislikeRemote = msg2call.createQueueRemote('dislike')

    socket.on('open', () => {
      if (this.#ws !== socket) return
      this.#failedNum = 0
      this.#resetHeartbeat()
      this.#setStatus('connected')
    })
    socket.on('ping', () => {
      this.#resetHeartbeat()
    })
    socket.on('pong', () => {
      this.#resetHeartbeat()
    })
    socket.on('message', (data, _isBinary) => {
      if (this.#ws !== socket) return
      this.#resetHeartbeat()
      void this.#handleMessage(toText(data), socket)
    })
    socket.on('close', (code, reason) => {
      if (this.#ws !== socket) return
      this.#ws = undefined
      this.#msg2call?.destroy()
      this.#msg2call = undefined
      this.#clearHeartbeat()
      if (this.#stoped) {
        this.#setStatus('disconnected')
        return
      }
      if (code === 4100) {
        // the sync server rejected us, most likely the client key is no longer valid
        this.#setStatus('error', 'Authentication rejected by the sync server (4100)')
        this.#handlers.onError?.(new Error('Authentication rejected by the sync server (4100)'))
        return
      }
      this.#setStatus('disconnected', reason.toString() || `closed with code ${code}`)
      this.#scheduleReconnect()
    })
    socket.on('error', (error) => {
      if (this.#ws !== socket) return
      this.#handleSocketError(error)
    })
  }

  /** Stop the client and close the connection */
  stop() {
    this.#stoped = true
    this.#clearHeartbeat()
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer)
      this.#reconnectTimer = undefined
    }
    this.#cleanupSocket()
    this.#setStatus('disconnected')
  }

  /**
   * Push a local list change to the sync server.
   * The sync server will persist it and broadcast it to the other devices.
   */
  async sendListAction(action: LxListAction): Promise<void> {
    const remote = this.#listRemote
    if (!remote) throw new Error('Not connected to the sync server')
    await remote.onListSyncAction(action)
  }

  /**
   * Push a local dislike list change to the sync server.
   * The sync server will persist it and broadcast it to the other devices.
   */
  async sendDislikeAction(action: LxDislikeAction): Promise<void> {
    const remote = this.#dislikeRemote
    if (!remote) throw new Error('Not connected to the sync server')
    await remote.onDislikeSyncAction(action)
  }

  #cleanupSocket() {
    const socket = this.#ws
    this.#ws = undefined
    this.#listRemote = undefined
    this.#dislikeRemote = undefined
    if (socket) {
      socket.removeAllListeners()
      try {
        socket.close()
      } catch {}
    }
    this.#msg2call?.destroy()
    this.#msg2call = undefined
  }

  #buildFuncsObject() {
    const handlers = this.#handlers
    const funcs = {
      getEnabledFeatures: (serverType: string, supportedFeatures: Record<string, number>) => {
        return handlers.getEnabledFeatures(serverType, supportedFeatures)
      },
      list_sync_get_md5: async () => {
        this.#setStatus('syncing')
        return handlers.getListMd5()
      },
      list_sync_get_sync_mode: async () => handlers.getSyncMode(),
      list_sync_get_list_data: async () => handlers.getListData(),
      list_sync_set_list_data: async (data: LxListData) => {
        await handlers.setListData(data)
      },
      list_sync_finished: async () => {
        await handlers.listFinished()
      },
      onListSyncAction: async (action: LxListAction) => {
        await handlers.onListAction(action)
      },
      dislike_sync_get_md5: async () => handlers.getDislikeMd5(),
      dislike_sync_get_sync_mode: async () => handlers.getSyncMode(),
      dislike_sync_get_list_data: async () => handlers.getDislikeData(),
      dislike_sync_set_list_data: async (rules: LxDislikeRules) => {
        await handlers.setDislikeData(rules)
      },
      dislike_sync_finished: async () => {
        await handlers.dislikeFinished()
      },
      onDislikeSyncAction: async (action: LxDislikeAction) => {
        await handlers.onDislikeAction(action)
      },
      finished: async () => {
        this.#failedNum = 0
        await handlers.finished()
        this.#setStatus('connected')
      },
    }
    if (this.#enableDislike) return funcs
    // Do not advertise the dislike feature when it is disabled
    const features = this.#handlers.getEnabledFeatures
    return {
      ...funcs,
      getEnabledFeatures: (serverType: string, supportedFeatures: Record<string, number>) => {
        const result = features(serverType, supportedFeatures)
        if (!result || typeof result != 'object') return result

        const { dislike, ...rest } = result
        return rest
      },
    }
  }

  async #handleMessage(raw: string, socket: WebSocket) {
    // The sync server sends a plain `ping` string to mobile clients
    if (raw === 'ping') return
    let data: string
    try {
      data = await decryptMsg(raw)
    } catch (error) {
      this.#handlers.onError?.(error as Error)
      return
    }
    if (this.#ws !== socket) return
    this.#msg2call?.onMessage(data)
  }

  #handleSocketError(error: Error) {
    this.#handlers.onError?.(error)
    this.#setStatus('error', error.message)
    this.#clearHeartbeat()
    if (this.#stoped) return
    this.#scheduleReconnect()
  }

  #scheduleReconnect() {
    if (this.#stoped || this.#reconnectTimer) return
    this.#failedNum++
    const delay = Math.min(MIN_RECONNECT_DELAY + Math.floor(this.#failedNum / 2) * 3000, MAX_RECONNECT_DELAY)
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = undefined
      this.connect()
    }, delay)
    this.#reconnectTimer.unref()
  }

  #resetHeartbeat() {
    this.#clearHeartbeat()
    this.#heartbeatTimer = setTimeout(() => {
      this.#heartbeatTimer = undefined
      // No traffic from the server for a while, the connection is considered dead
      const socket = this.#ws
      if (!socket) return
      this.#ws = undefined
      socket.removeAllListeners()
      socket.terminate()
      this.#msg2call?.destroy()
      this.#msg2call = undefined
      this.#setStatus('disconnected', 'heartbeat timeout')
      this.#scheduleReconnect()
    }, HEARTBEAT_TIMEOUT)
    this.#heartbeatTimer.unref()
  }

  #clearHeartbeat() {
    if (this.#heartbeatTimer) {
      clearTimeout(this.#heartbeatTimer)
      this.#heartbeatTimer = undefined
    }
  }

  #setStatus(status: SyncClientStatus, message?: string) {
    if (this.#status === status && !message) return
    this.#status = status
    this.#handlers.onStatusChange?.({ status, message })
  }
}
