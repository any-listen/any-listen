import { createIPC } from '@/preload/ipc'
import type { IPCSocket } from '@/preload/ws'

import { createClientApp, createExposeApp } from './app'
import { createClientData } from './data'
import { createClientDislike, createExposeDislike } from './dislike'
import { createClientExtension, createExposeExtension } from './extension'
import { createClientHotkey, createExposeHotkey } from './hotkey'
import { createClientList, createExposeList } from './list'
import { createClientMusic } from './music'
import { createClientPlayer, createExposePlayer } from './player'
import { createClientSoundEffect } from './soundEffect'
import { createClientTheme, createExposeTheme } from './theme'

console.log('preload win main')

export type ExposeFunctions = AnyListen.IPC.ClientIPCActions<IPCSocket>
export type ExposeServerFunctions = Omit<
  AnyListen.IPC.ServerIPC,
  'showOpenDialog' | 'showSaveDialog' | 'openDirInExplorer' | 'openDevTools' | 'getSystemFonts' | 'minWindow' | 'fullscreenWindow'
>
export type ClientCall = AnyListen.IPC.ClientIPC

let host = `${location.origin}${location.pathname}`
if (import.meta.env.DEV) host = 'http://localhost:9500'

const connectIPCService: AnyListen.IPC.ConnectIPCSrivice = ({
  onConnected,
  onDisconnected,
  onFailed,
  onLogout,
  pwd,
  clientCall,
}) => {
  const exposeObj: ExposeFunctions = {
    ...createExposeApp(clientCall),
    ...createExposePlayer(clientCall),
    ...createExposeHotkey(clientCall),
    ...createExposeList(clientCall),
    ...createExposeDislike(clientCall),
    ...createExposeTheme(clientCall),
    ...createExposeExtension(clientCall),
  }
  createIPC({
    exposeObj,
    host,
    authCode: pwd,
    winType: 'main',
    onDisconnected,
    onFailed,
    onLogout,
    onConnected(ipcSocket) {
      const ipc: ExposeServerFunctions = {
        ...createClientApp(ipcSocket),
        ...createClientPlayer(ipcSocket),
        ...createClientData(ipcSocket),
        ...createClientHotkey(ipcSocket),
        ...createClientList(ipcSocket),
        ...createClientMusic(ipcSocket),
        ...createClientDislike(ipcSocket),
        ...createClientTheme(ipcSocket),
        ...createClientExtension(ipcSocket),
        ...createClientSoundEffect(ipcSocket),
      }
      onConnected(ipc as AnyListen.IPC.ServerIPC)
    },
  })
}

// @ts-expect-error
window.__anylisten_ipc_init__ = connectIPCService
