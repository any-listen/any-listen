/**
 * A minimal re-implementation of `message2call@0.1.x`, which is the rpc layer
 * used by the LX Music sync server. The version shipped with any-listen
 * (`message2call@2`) uses a completely different (array based) wire format and
 * is therefore not compatible with the sync server.
 *
 * Wire format:
 *   request  -> { name: string, path: string[], data: unknown[] }
 *   response -> { name: string, error: string | null, data?: unknown }
 *   where `name` is `${path.join('.')}__${random}`
 */

interface PendingCall {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

interface QueueGroup {
  handling: boolean
  queue: Array<() => void>
}

export interface Msg2CallOptions<F> {
  funcsObj: F
  sendMessage: (data: string) => void
  timeout?: number
  onError?: (error: Error) => void
}

interface WireRequest {
  name: string
  path: string[]
  data: unknown[]
}

interface WireResponse {
  name: string
  error: string | null
  data?: unknown
}

/** Run the next queued call of a group, a group handles its calls one by one */
const runNextInQueue = (queueGroup: QueueGroup) => {
  if (queueGroup.handling) return
  const task = queueGroup.queue.shift()
  if (!task) return
  queueGroup.handling = true
  task()
}

export class Msg2Call<F extends Record<string, (...args: never[]) => unknown>> {
  static DEFAULT_TIMEOUT = 120_000

  readonly remote: F
  private readonly funcsObj: F
  private readonly sendMessage: (data: string) => void
  private readonly timeout: number
  private readonly onError?: (error: Error) => void

  private readonly pending = new Map<string, PendingCall>()
  private readonly queues = new Map<string, QueueGroup>()
  private readonly subRemotes = new Map<string, unknown>()
  private destroyed = false

  constructor(options: Msg2CallOptions<F>) {
    this.funcsObj = options.funcsObj
    this.sendMessage = options.sendMessage
    this.timeout = options.timeout ?? Msg2Call.DEFAULT_TIMEOUT
    this.onError = options.onError
    this.remote = this.createRemote([]) as F
  }

  /** Returns a remote whose calls are executed one by one (per group) */
  createQueueRemote(group: string) {
    let remote = this.subRemotes.get(group) as F | undefined
    if (!remote) {
      remote = this.createRemote([], group) as F
      this.subRemotes.set(group, remote)
    }
    return remote
  }

  onMessage(raw: string) {
    let message: unknown
    try {
      message = JSON.parse(raw)
    } catch {
      return
    }
    if (typeof message != 'object' || message == null) return
    const msg = message as Partial<WireRequest & WireResponse>
    if (typeof msg.name != 'string') return
    if (Array.isArray(msg.path)) {
      void this.handleRequest(msg as WireRequest)
    } else {
      this.handleResponse(msg as WireResponse)
    }
  }

  destroy() {
    this.destroyed = true
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(new Error('msg2call destroyed'))
    }
    this.pending.clear()
    this.queues.clear()
    this.subRemotes.clear()
  }

  private createRemote(path: string[], group?: string): unknown {
    const invokeRemote = async (args: unknown[]) => this.invoke(group, path, args)
    return new Proxy(() => {}, {
      get: (_target, key) => {
        if (typeof key == 'symbol' || key == 'then') return undefined
        return this.createRemote([...path, key], group)
      },
      apply: async (_target, _thisArg, args: unknown[]) => invokeRemote(args),
    })
  }

  private async invoke(group: string | undefined, path: string[], args: unknown[]): Promise<unknown> {
    if (this.destroyed) throw new Error('msg2call destroyed')
    if (!group) return this.sendCall(path, args)
    return new Promise((resolve, reject) => {
      const queueGroup = this.getQueueGroup(group)
      queueGroup.queue.push(() => {
        void (async () => {
          try {
            resolve(await this.sendCall(path, args))
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)))
          } finally {
            queueGroup.handling = false
            runNextInQueue(queueGroup)
          }
        })()
      })
      runNextInQueue(queueGroup)
    })
  }

  private getQueueGroup(group: string): QueueGroup {
    let queueGroup = this.queues.get(group)
    if (!queueGroup) {
      queueGroup = { handling: false, queue: [] }
      this.queues.set(group, queueGroup)
    }
    return queueGroup
  }

  private async sendCall(path: string[], args: unknown[]): Promise<unknown> {
    const eventName = `${path.join('.')}__${Math.random().toString().substring(2)}`
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(eventName)
        reject(new Error(`[lx-sync] call ${path.join('.')} timeout`))
      }, this.timeout)
      // don't keep the process alive because of a pending rpc call
      if (typeof timer.unref == 'function') timer.unref()
      this.pending.set(eventName, { resolve, reject, timer })
      try {
        this.sendMessage(JSON.stringify({ name: eventName, path, data: args }))
      } catch (error) {
        clearTimeout(timer)
        this.pending.delete(eventName)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  private handleResponse(msg: WireResponse) {
    const pending = this.pending.get(msg.name)
    if (!pending) return
    this.pending.delete(msg.name)
    clearTimeout(pending.timer)
    if (msg.error) {
      pending.reject(new Error(msg.error))
    } else {
      pending.resolve(msg.data)
    }
  }

  private async handleRequest(msg: WireRequest) {
    const reply = (error: string | null, data?: unknown) => {
      if (this.destroyed) return
      try {
        this.sendMessage(JSON.stringify({ name: msg.name, error, data }))
      } catch (error) {
        this.onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    }
    let target: unknown = this.funcsObj
    for (const key of msg.path) {
      if (target == null) {
        target = undefined
        break
      }
      target = (target as Record<string, unknown>)[key]
    }
    if (typeof target != 'function') {
      reply(`\`${msg.path.join('.')}\` is not a function`)
      return
    }
    try {
      const result = await (target as (...args: unknown[]) => unknown).apply(this.funcsObj, msg.data)
      reply(null, result)
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)))
      reply(error instanceof Error ? error.message : String(error))
    }
  }
}
