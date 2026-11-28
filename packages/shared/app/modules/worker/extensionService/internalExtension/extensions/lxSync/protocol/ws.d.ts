// Minimal type declarations for the subset of `ws` used by the sync client.
// The workspace does not ship a `@types/ws` dependency, declaring what we touch here keeps
// `tsc` clean without adding a dependency just for the extension.
declare module 'ws' {
  import type { EventEmitter } from 'node:events'

  type RawData = Buffer | ArrayBuffer | Buffer[]

  interface ClientOptions {
    /** Custom headers sent with the upgrade request */
    headers?: Record<string, string>
    /** Whether to follow HTTP redirects */
    followRedirects?: boolean
    /** Defaults to true */
    perMessageDeflate?: boolean
    /** Milliseconds before the connection attempt is aborted */
    handshakeTimeout?: number
  }

  class WebSocket extends EventEmitter {
    static readonly CONNECTING: 0
    static readonly OPEN: 1
    static readonly CLOSING: 2
    static readonly CLOSED: 3

    readonly readyState: 0 | 1 | 2 | 3
    readonly protocol: string
    readonly url: string

    constructor(url: string, options?: ClientOptions)

    send(data: string | Buffer): void
    ping(data?: unknown): void
    close(code?: number, reason?: string): void
    terminate(): void
  }

  export type { ClientOptions, RawData }
  export default WebSocket
  export { WebSocket }
}
