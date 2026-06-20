import { IPC_CHANNEL_NAMES } from '@any-listen/common/constants'
import { ipcRenderer } from 'electron'

import { IPC_NAMES } from '@/shared/ipc/names'
import { createMainCall } from '@/shared/ipc/renderer'

import { createClientApp, createExposeApp } from './app'
import './env'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

export type ExposeFunctions = AnyListen.IPC_Lyric.ClientIPCActions<Electron.IpcRendererEvent>
// export type ExposeServerFunctions = Omit<AnyListen.IPC_Lyric.ServerIPC, 'showDesktopLyric' | 'hideDesktopLyric'>
export type ExposeServerFunctions = AnyListen.IPC_Lyric.ServerIPC
export type MainCall = AnyListen.IPC_Lyric.ServerIPC
export type ClientCall = AnyListen.IPC_Lyric.ClientIPC

console.log('preload')

const connectIPCService: AnyListen.IPC_Lyric.ConnectIPCSrivice = ({ onConnected, clientCall }) => {
  const exposeObj: ExposeFunctions = {
    ...createExposeApp(clientCall),
  }
  ipcRenderer.on(IPC_CHANNEL_NAMES.WIN_MAIN_CHANNEL_PORT, (event) => {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.postMessage(IPC_CHANNEL_NAMES.WIN_MAIN_CHANNEL_PORT, '*', event.ports)
  })
  const mainCallUtil = createMainCall<AnyListen.IPC_Lyric.ServerIPC>(IPC_NAMES.VIEW_LYRIC, exposeObj)
  const mainCall = mainCallUtil.remote

  const ipc: ExposeServerFunctions = {
    ...createClientApp(mainCall),
  }
  onConnected(ipc)
}

// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
window.__anylisten_ipc_init__ = connectIPCService
