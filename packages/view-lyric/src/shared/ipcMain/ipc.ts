import { IPC_CHANNEL_NAMES } from '@any-listen/common/constants'
import { createMessage2Call } from 'message2call'

import { sendWinMainIPCConnected, sendWinMainIPCDisconnected } from '@/modules/app/store/action'

import { exposeObj } from './exposeObj'

let msg2call: ReturnType<typeof createMessage2Call<AnyListen.IPCWinMainActions.IPCWinMainActions>> | null = null

const heartbeatTools = {
  port: null as MessagePort | null,
  checkTimeout: null as number | null,
  destroy() {
    this.stop()
    sendWinMainIPCDisconnected()
  },
  heartbeat() {
    this.clearTimeout()
    this.checkTimeout = setTimeout(() => {
      this.checkTimeout = null
      this.destroy()
    }, 10_000)
  },
  clearTimeout() {
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout)
      this.checkTimeout = null
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

const handleInitIpc = (port: MessagePort) => {
  if (import.meta.env.VITE_IS_WEB) {
    heartbeatTools.stop()
  }
  msg2call = createMessage2Call<AnyListen.IPCWinMainActions.IPCWinMainActions>({
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
  if (import.meta.env.VITE_IS_WEB) {
    heartbeatTools.run(port)
  }
  sendWinMainIPCConnected()
}

export const initIpcWinMain = () => {
  window.onmessage = (event) => {
    console.log('window message', event.data, event.origin, IPC_CHANNEL_NAMES.WIN_MAIN_CHANNEL_PORT)
    if (event.data !== IPC_CHANNEL_NAMES.WIN_MAIN_CHANNEL_PORT) return
    if (!import.meta.env.DEV && import.meta.env.VITE_IS_WEB) {
      if (event.origin !== location.origin) return
    }
    // event.source === window means the message is coming from the preload
    // script, as opposed to from an <iframe> or other source.
    // console.log('initIpcDesktopLyric', event)
    handleInitIpc(event.ports[0])
  }
}

const _ipc = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return msg2call?.remote[property as keyof AnyListen.IPCWinMainActions.IPCWinMainActions]
    },
  }
) as AnyListen.IPCWinMainActions.IPCWinMainActions

export { _ipc as ipc }
