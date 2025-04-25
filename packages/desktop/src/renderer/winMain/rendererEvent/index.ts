// import hotKey from './hotKey'
// import kw_decodeLyric from './kw_decodeLyric'
// import tx_decodeLyric from './tx_decodeLyric'
// import userApi from './userApi'
// import sync from './sync'
// import data from './data'
// import music from './music'
// import download from './download'
import { createRendererCall } from '@/shared/ipc/main'
import { IPC_NAMES } from '@/shared/ipc/names'
// import soundEffect from './soundEffect'
// import { sendEvent } from '../main'
// import { registerDislikeWinRendererEvents } from '@/modules/dislikeList'
// import { registerMusicWinRendererEvents } from '@/modules/musicList'
import { createExposeApp } from './app'
import { createExposePlayer } from './player'
import { createExposeData } from './data'
import { createExposeHotkey } from './hotKey'
import { createExposeList } from './list'
import { createExposeMusic } from './music'
import { createExposeDislike } from './dislike'
import { createExposeTheme } from './theme'
import { createExposeExtension } from './extension'
import { createExposeSoundEffect } from './soundEffect'
import { onDislikeAction } from '@any-listen/app/modules/dislikeList'
import { onMusicListAction } from '@any-listen/app/modules/musicList'
import { onPlayHistoryListAction, onPlayListAction } from '@any-listen/app/modules/player'

export type ExposeFunctions = Omit<
  AnyListen.IPC.ServerIPCActions<Electron.IpcRendererEvent>,
  'fileSystemAction' | 'getLoginDevices' | 'removeLoginDevice' | 'logout' | 'messageBoxConfirm'
>

let isInitialized = false
let ipc: AnyListen.IPC.ClientIPC
export const init = (sendEvent: (name: string, ...args: unknown[]) => void) => {
  if (isInitialized) return
  isInitialized = true

  const exposeObj: ExposeFunctions = {
    ...createExposeApp(),
    ...createExposePlayer(),
    ...createExposeData(),
    ...createExposeHotkey(),
    ...createExposeList(),
    ...createExposeMusic(),
    ...createExposeDislike(),
    ...createExposeTheme(),
    ...createExposeExtension(),
    ...createExposeSoundEffect(),
  }

  const rendererCallUtil = createRendererCall<AnyListen.IPC.ClientIPC>(IPC_NAMES.VIEW_MAIN, exposeObj, sendEvent)

  ipc = rendererCallUtil.remote

  onPlayListAction(ipc.playListAction)
  onPlayHistoryListAction(ipc.playHistoryListAction)
  onDislikeAction(ipc.dislikeAction)
  onMusicListAction(ipc.listAction)
}

const _ipc = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return ipc[property as keyof AnyListen.IPC.ClientIPC]
    },
  }
) as AnyListen.IPC.ClientIPC

export { _ipc as rendererIPC }
