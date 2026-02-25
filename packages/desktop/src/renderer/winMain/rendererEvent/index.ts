import { onDislikeAction } from '@any-listen/app/modules/dislikeList'
import { onMusicListAction } from '@any-listen/app/modules/musicList'
import { onPlayHistoryListAction, onPlayListAction } from '@any-listen/app/modules/player'

import { createRendererCall } from '@/shared/ipc/main'
import { IPC_NAMES } from '@/shared/ipc/names'

import { createExposeApp } from './app'
import { createExposeData } from './data'
import { createExposeDislike } from './dislike'
import { createExposeExtension } from './extension'
import { createExposeHotkey } from './hotKey'
import { createExposeList } from './list'
import { createExposeMusic } from './music'
import { createExposePlayer } from './player'
import { createExposeSoundEffect } from './soundEffect'
import { createExposeTheme } from './theme'

export type ExposeFunctions = Omit<
  AnyListen.IPC.ServerIPCActions<Electron.IpcRendererEvent>,
  'fileSystemAction' | 'getLoginDevices' | 'removeLoginDevice' | 'logout' | 'messageBoxConfirm' | 'setSystemThemeMode'
>

let isInitialized = false
let ipc: AnyListen.IPC.ClientIPC
export const init = (sendEvent: (channelName: string, data: unknown) => void) => {
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
