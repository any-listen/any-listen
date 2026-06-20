import { createRendererCall } from '@/shared/ipc/main'
import { IPC_NAMES } from '@/shared/ipc/names'

import { createExposeApp } from './app'

// export type ExposeFunctions = Omit<
//   AnyListen.IPC_Lyric.ServerIPCActions<Electron.IpcRendererEvent>,
//   'showDesktopLyric' | 'hideDesktopLyric'
// >
export type ExposeFunctions = AnyListen.IPC_Lyric.ServerIPCActions<Electron.IpcRendererEvent>

let isInitialized = false
let ipc: AnyListen.IPC_Lyric.ClientIPC

const _ipc = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return ipc[property as keyof AnyListen.IPC_Lyric.ClientIPC]
    },
  }
) as AnyListen.IPC_Lyric.ClientIPC

export const init = (sendEvent: (channelName: string, data: unknown) => void) => {
  if (isInitialized) return
  isInitialized = true

  const exposeObj: ExposeFunctions = {
    ...createExposeApp(_ipc),
  }

  const rendererCallUtil = createRendererCall<AnyListen.IPC_Lyric.ClientIPC>(IPC_NAMES.VIEW_LYRIC, exposeObj, sendEvent)

  ipc = rendererCallUtil.remote
}

export { _ipc as rendererIPC }
