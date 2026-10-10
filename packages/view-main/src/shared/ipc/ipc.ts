import app from './app/remote'
import command from './command/remote'
import dislike from './dislike/remote'
import download from './download/remote'
import extension from './extension/remote'
import hotkey from './hotkey/remote'
import list from './list/remote'
import player from './player/remote'
import sync from './sync/remote'
import theme from './theme/remote'

let connectIPCService: AnyListen.IPC.ConnectIPCSrivice | null
let ipc: AnyListen.IPC.ServerIPC

export const connectIPC = (
  onConnected: () => void,
  onDisconnected: () => void,
  onFailed: (message: string) => void,
  onLogout: () => void,
  pwd = ''
) => {
  if (!connectIPCService) {
    if (!window.__anylisten_ipc_init__) throw new Error('ipc is not available')
    connectIPCService = window.__anylisten_ipc_init__
    delete window.__anylisten_ipc_init__
  }
  const exposeFuncs: AnyListen.IPC.ClientIPC = {
    ...app,
    ...dislike,
    ...download,
    ...extension,
    ...hotkey,
    ...list,
    ...player,
    ...theme,
    ...sync,
    ...command,
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
    onLogout,
    pwd,
  })
}

const _ipc = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return ipc[property as keyof AnyListen.IPC.ServerIPC]
    },
  }
) as AnyListen.IPC.ServerIPC

export { _ipc as ipc }
