interface _ClientCommonActions {
  /** 鼠标离开窗口 */
  mouseLeave: () => void
}
interface _ServerCommonActions {
  /** 窗口初始化完成 */
  inited: () => void
  /** 设置窗口大小 */
  setWinBounds: (bounds: AnyListen.DesktopLyric.NewBounds) => void
  /** 鼠标进入或离开窗口 */
  mouseEnterLeave: (isEnter: boolean) => void
}

type ClientAllActions = AnyListen.IPC_Lyric.ClientCommonActions
type ServerAllActions = AnyListen.IPC_Lyric.ServerCommonActions

declare global {
  namespace AnyListen {
    namespace IPC_Lyric {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type WarpIPCHandlerActions<Socket, Actions extends Record<string, (...args: any[]) => Promise<any>>> = {
        [K in keyof Actions]: Socket extends undefined
          ? Actions[K]
          : (...args: [Socket, ...Parameters<Actions[K]>]) => ReturnType<Actions[K]>
      }

      type ConnectIPCSrivice = (options: {
        onConnected: (ipc: ServerIPC) => void
        onDisconnected: () => void
        onFailed: (message: string) => void
        clientCall: ClientIPC
      }) => void
      type WinType = 'main' | 'desktopLyric'
      type ServerCommonActions = WarpPromiseRecord<_ServerCommonActions>
      type ClientCommonActions = WarpPromiseRecord<_ClientCommonActions>

      type ClientICPCommonActions<Socket = undefined> = WarpIPCHandlerActions<Socket, ClientCommonActions>
      type ClientIPCActions<Socket = undefined> = WarpIPCHandlerActions<Socket, ClientAllActions>

      type ServerICPCommonActions<Socket = undefined> = WarpIPCHandlerActions<Socket, ServerCommonActions>
      type ServerIPCActions<Socket = undefined> = WarpIPCHandlerActions<Socket, ServerAllActions>

      type ClientIPC = ClientAllActions
      type ServerIPC = ServerAllActions

      interface NodeEnv {
        setTimeout: (callback: () => void, delay?: number) => number
        clearTimeout: (id: number) => void
      }
    }
  }
}

export {}
