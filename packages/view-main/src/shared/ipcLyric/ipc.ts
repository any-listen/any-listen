import { IPC_CHANNEL_NAMES } from '@any-listen/common/constants'
import { createMessage2Call } from 'message2call'

import { onSettingChanged } from '@/modules/setting/shared'

import { desktopLyricDestroyedEvent, desktopLyricInitedEvent } from './event'
import { exposeObj } from './exposeObj'

let msg2call: ReturnType<typeof createMessage2Call<AnyListen.IPCWinLyricActions.IPCWinLyricActions>> | null = null

const heartbeatTools = {
  port: null as MessagePort | null,
  pingTimeout: null as number | null,
  pingTimeout2: null as number | null,
  timeout: 2000,
  destroy() {
    this.stop()
    desktopLyricDestroyedEvent.emit()
  },
  heartbeat() {
    this.clearTimeout()
    this.pingTimeout = setTimeout(() => {
      this.pingTimeout = null
      msg2call?.remote
        .ping()
        .then(() => {
          this.heartbeat()
        })
        .catch(() => {
          this.destroy()
        })
      this.pingTimeout2 = setTimeout(() => {
        this.pingTimeout2 = null
        this.destroy()
      }, this.timeout)
    }, 5_000)
  },
  clearTimeout() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
    if (this.pingTimeout2) {
      clearTimeout(this.pingTimeout2)
      this.pingTimeout2 = null
    }
  },
  handleMessage({ data }: MessageEvent<unknown>) {
    heartbeatTools.heartbeat()
  },
  run(port: MessagePort) {
    this.port = port
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.port.addEventListener('message', this.handleMessage)
  },
  stop() {
    if (!msg2call) return
    console.log('stop')
    msg2call.destroy()
    msg2call = null
    this.clearTimeout()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.port?.removeEventListener('message', this.handleMessage)
    this.port = null
  },
}

const handleNewLyricWindow = (port: MessagePort) => {
  heartbeatTools.stop()
  msg2call = createMessage2Call<AnyListen.IPCWinLyricActions.IPCWinLyricActions>({
    exposeObj,
    isSendErrorStack: true,
    timeout: 0,
    sendMessage(message) {
      port.postMessage(message)
    },
  })
  port.onmessage = (event) => {
    msg2call?.message(event.data)
  }
  port.onmessageerror = (event) => {
    console.error('Worker error:', event)
  }
  heartbeatTools.run(port)
  desktopLyricInitedEvent.emit(msg2call.remote)
}

export const initIpcLyric = () => {
  window.onmessage = (event) => {
    // event.source === window means the message is coming from the preload
    // script, as opposed to from an <iframe> or other source.
    if (event.source === window && event.data === IPC_CHANNEL_NAMES.WIN_LYRIC_CHANNEL_PORT) {
      // console.log('initIpcLyric', event)
      handleNewLyricWindow(event.ports[0])
    }
  }
  onSettingChanged('desktopLyric.enable', (enable) => {
    if (enable) return
    heartbeatTools.destroy()
  })
}

const _ipc = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return msg2call?.remote[property as keyof AnyListen.IPCWinLyricActions.IPCWinLyricActions] ?? (() => {})
    },
  }
) as AnyListen.IPCWinLyricActions.IPCWinLyricActions

export { _ipc as ipc }
