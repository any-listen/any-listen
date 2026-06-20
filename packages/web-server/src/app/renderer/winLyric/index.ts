import { createClientApp } from './app'
// import { createClientPlayer, createExposePlayer } from './player'
// import { createClientTheme, createExposeTheme } from './theme'

console.log('preload win lyric')

// export type ExposeFunctions = AnyListen.IPC_Lyric.ClientIPCActions<IPCSocket>
// export type ExposeServerFunctions = AnyListen.IPC_Lyric.ServerIPC
export type ExposeServerFunctions = Omit<AnyListen.IPC_Lyric.ServerIPC, 'setWinBounds' | 'mouseEnterLeave'>

// export type ClientCall = AnyListen.IPC_Lyric.ClientIPC

// let host = `${location.origin}${location.pathname}`
// if (import.meta.env.DEV) host = 'http://localhost:9500'

const connectIPCService: AnyListen.IPC_Lyric.ConnectIPCSrivice = ({ onConnected, onDisconnected, onFailed }) => {
  // const exposeObj: ExposeFunctions = {
  //   ...createExposeApp(clientCall),
  //   ...createExposePlayer(clientCall),
  //   ...createExposeTheme(clientCall),
  // }
  const ipc: ExposeServerFunctions = {
    ...createClientApp(),
  }
  onConnected(ipc as AnyListen.IPC_Lyric.ServerIPC)
}

// @ts-expect-error
window.__anylisten_ipc_init__ = connectIPCService
