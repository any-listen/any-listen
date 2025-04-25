// import { rendererSend, rendererInvoke, rendererOn, rendererOff } from '@/shared/rendererIpc'
// import { HOTKEY_RENDERER_EVENT_NAME, VIEW_MAIN_RENDERER_EVENT_NAME, CMMON_EVENT_NAME, THEME_RENDERER_EVENT_NAME } from '@/shared/ipcNames'
// import type { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater'
// import * as hotKeys from '@any-listen/common/hotKey'
// import { APP_EVENT_NAMES, DATA_KEYS, DEFAULT_SETTING } from '@any-listen/common/constants'
import { createMainCall } from '@/shared/ipc/renderer'
import { createClientApp, createExposeApp } from './app'
import { createClientPlayer, createExposePlayer } from './player'
import { createClientData } from './data'
import { createClientHotkey, createExposeHotkey } from './hotkey'
import { createClientList, createExposeList } from './list'
import { createClientMusic } from './music'
import { createClientDislike, createExposeDislike } from './dislike'
import { createClientTheme, createExposeTheme } from './theme'
import { createClientExtension, createExposeExtension } from './extension'
import { createClientSoundEffect } from './soundEffect'
import { IPC_NAMES } from '@/shared/ipc/names'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

export type ExposeFunctions = AnyListen.IPC.ClientIPCActions<Electron.IpcRendererEvent>
export type ExposeServerFunctions = Omit<
  AnyListen.IPC.ServerIPC,
  'fileSystemAction' | 'getLoginDevices' | 'removeLoginDevice' | 'logout'
>
export type MainCall = typeof mainCall

const exposeObj: ExposeFunctions = {
  ...createExposeApp(),
  ...createExposePlayer(),
  ...createExposeHotkey(),
  ...createExposeList(),
  ...createExposeDislike(),
  ...createExposeTheme(),
  ...createExposeExtension(),
}

const mainCallUtil = createMainCall<AnyListen.IPC.ServerIPC>(IPC_NAMES.VIEW_MAIN, exposeObj)
const mainCall = mainCallUtil.remote
console.log('preload')

const connectIPCService: AnyListen.IPC.ConnectIPCSrivice = (onConnected) => {
  const ipc: ExposeServerFunctions = {
    ...createClientApp(mainCall),
    ...createClientPlayer(mainCall),
    ...createClientData(mainCall),
    ...createClientHotkey(mainCall),
    ...createClientList(mainCall),
    ...createClientMusic(mainCall),
    ...createClientDislike(mainCall),
    ...createClientTheme(mainCall),
    ...createClientExtension(mainCall),
    ...createClientSoundEffect(mainCall),
  }
  onConnected(ipc as AnyListen.IPC.ServerIPC)
}

// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
window.__anylisten_ipc_init__ = connectIPCService
