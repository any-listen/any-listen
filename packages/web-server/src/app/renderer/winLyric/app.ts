import { IPC_CHANNEL_NAMES } from '@any-listen/common/constants'

// 暴露给前端的方法
export const createClientApp = () => {
  return {
    async inited() {
      console.log('inited', window.opener)
      if (!window.opener) {
        throw new Error('Desktop lyric window must be opened by the main window')
      }
      // TODO: dev and prod
      ;(window.opener as Window).postMessage(IPC_CHANNEL_NAMES.WIN_CHANNEL_PORT_REQUEST, '*')
    },
  } satisfies Partial<AnyListen.IPC_Lyric.ServerIPC>
}
