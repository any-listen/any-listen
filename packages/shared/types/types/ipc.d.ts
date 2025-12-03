import './dislike_list_ipc'
import './extension_ipc'
import type { ClientCommonActions as _ClientCommonActions } from './ipc_client_common_actions'
import type { ServerCommonActions as _ServerCommonActions } from './ipc_server_common_actions'
import './list_ipc'
import './player_ipc'
import './sound_effect_ipc'
import './theme_ipc'

// type ExcludeSendActions<Actions extends Record<string, any>> = Pick<Actions, {
//   [K in keyof Actions]: K extends `send${string}` ? never : K
// }[keyof Actions]>
// type PickSendActions<Actions extends Record<string, any>> = Pick<Actions, {
//   [K in keyof Actions]: K extends `send${string}` ? K : never
// }[keyof Actions]>

// type WarpOnActions<Actions extends Record<string, (...args: any[]) => any>> = {
//   [K in keyof Actions as `on${Capitalize<string & K>}`]: (handler: (...args: Parameters<Actions[K]>) => void) => () => void
// }

// type RenameSend2On<T> = {
//   [K in keyof T as K extends `send${infer R}` ? `on${R}` : K]: T[K];
// }
// type WarpSendActions<Actions extends Record<string, (...args: any[]) => any>> = WarpOnActions<PickSendActions<Actions>>

type ClientAllActions = AnyListen.IPC.ClientCommonActions &
  AnyListen.IPCTheme.ClientActions &
  AnyListen.IPCPlayer.ClientActions &
  AnyListen.IPCList.ClientActions &
  AnyListen.IPCDislikeList.ClientActions &
  AnyListen.IPCExtension.ClientActions
type ServerAllActions = AnyListen.IPC.ServerCommonActions &
  AnyListen.IPCMusic.ServerActions &
  AnyListen.IPCTheme.ServerActions &
  AnyListen.IPCPlayer.ServerActions &
  AnyListen.IPCList.ServerActions &
  AnyListen.IPCDislikeList.ServerActions &
  AnyListen.IPCExtension.ServerActions &
  AnyListen.IPCSoundEffect.ServerActions

declare global {
  namespace AnyListen {
    namespace IPC {
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
        onLogout: () => void
        pwd: string
        clientCall: ClientIPC
      }) => void
      type WinType = 'main'
      type ServerCommonActions = _ServerCommonActions & IPCMusic.ServerActions & IPCSoundEffect.ServerActions
      type ClientCommonActions = _ClientCommonActions

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

// export {}
