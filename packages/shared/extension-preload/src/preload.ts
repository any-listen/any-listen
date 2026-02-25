import { createMessage2Call } from 'message2call'

import { triggerTimeout } from '@/apis/global'

import { onListProviderAction } from './apis/listProvider'
import { onResourceAction } from './apis/resource'
import {
  configurationEvent,
  localeEvent,
  musicListActionEvent,
  playHistoryListActionEvent,
  playListActionEvent,
  playerEvent,
} from './event'
import { hostContext } from './host/state'
import { setMessage } from './i18n'

const exposeObj = {
  updateLocale(locale) {
    hostContext.locale = locale
    localeEvent.emit(locale)
  },
  updateI18nMessage(message) {
    setMessage(message)
  },
  musicListAction(action) {
    musicListActionEvent.emit(action)
  },
  playerEvent(event) {
    playerEvent.emit(event)
  },
  playListAction(action) {
    playListActionEvent.emit(action)
  },
  playHistoryListAction(action) {
    playHistoryListActionEvent.emit(action)
  },
  configurationChanged(keys, config) {
    configurationEvent.emit(keys, config)
  },
  async resourceAction<T extends keyof AnyListen.IPCExtension.ResourceAction>(
    action: T,
    params: Parameters<AnyListen.IPCExtension.ResourceAction[T]>[0]
  ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ResourceAction[T]>>> {
    return onResourceAction(action, params)
  },
  async listProviderAction<T extends keyof AnyListen.IPCExtension.ListProviderAction>(
    action: T,
    params: Parameters<AnyListen.IPCExtension.ListProviderAction[T]>[0]
  ): Promise<Awaited<ReturnType<AnyListen.IPCExtension.ListProviderAction[T]>>> {
    return onListProviderAction(action, params)
  },
  // clientConnectAction(id, isConnected) {
  //   if (isConnected) {
  //     extensionAPIEvent.clientConnected(id)
  //   } else {
  //     extensionAPIEvent.clientDisconnected(id)
  //   }
  // },
} satisfies AnyListen.IPCExtension.ExtensionIPCActions

export const msg2call = createMessage2Call<AnyListen.HostFuncs>({
  exposeObj,
  isSendErrorStack: true,
  timeout: 0,
  sendMessage(data?: unknown) {
    hostContext.hostCall(hostContext.key, 'message', data as string | undefined)
  },
})

export const handleHostCall: NonNullable<AnyListen.ExtensionVM.VMContext['__ext_preload__']> = (key, action, data) => {
  if (key != hostContext.key) throw new Error('preload call illegal')
  if (action == 'message') {
    msg2call.message(data)
    return
  }
  data == null
    ? // @ts-expect-error
      handleHostCallActions(action)
    : handleHostCallActions(action, JSON.parse(data) as string | number)
}

const handleHostCallActions = <T extends keyof AnyListen.ExtensionVM.PreloadCallActions>(
  action: T,
  data: AnyListen.ExtensionVM.PreloadCallActions[T]
) => {
  switch (action) {
    case 'trigger_timeout':
      triggerTimeout(data as AnyListen.ExtensionVM.PreloadCallActions['trigger_timeout'])
      break

    default:
      break
  }
}

// const extensions = new Map<string, AnyListen.Extension.Extension>()
// export const registerExtension = (extension: AnyListen.Extension.Extension) => {
//   if (extensions.has(extension.id)) throw new Error('Repeated registration expansion')
//   extensions.set(extension.id, extension)
// }
