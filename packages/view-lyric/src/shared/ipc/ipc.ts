import app from './app/remote'

let connectIPCService: AnyListen.IPC_Lyric.ConnectIPCSrivice | null
let ipc: AnyListen.IPC_Lyric.ServerIPC

export const connectIPC = (onConnected: () => void, onDisconnected: () => void, onFailed: (message: string) => void) => {
  if (!connectIPCService) {
    if (!window.__anylisten_ipc_init__) throw new Error('ipc is not available')
    connectIPCService = window.__anylisten_ipc_init__
    delete window.__anylisten_ipc_init__
  }
  const exposeFuncs: AnyListen.IPC_Lyric.ClientIPC = {
    ...app,
  }
  connectIPCService({
    clientCall: exposeFuncs,
    onConnected: (_ipc) => {
      ipc = _ipc
      window.testData = ipc
      onConnected()
    },
    onDisconnected,
    onFailed,
  })
}

const _ipc = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return ipc[property as keyof AnyListen.IPC_Lyric.ServerIPC]
    },
  }
) as AnyListen.IPC_Lyric.ServerIPC

export { _ipc as ipc }
