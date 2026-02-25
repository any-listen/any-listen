import { EXTENSION_VM_IPC_FUNC_NAMES } from '@any-listen/common/constants'

import { setMessage } from '@/i18n'
import { checkLength } from '@/shared'

type HostCallFuncsMap = {
  [K in (typeof EXTENSION_VM_IPC_FUNC_NAMES)[number]]: Readonly<
    [K extends `__ext_host_call__${infer Name}` ? Name : never, (typeof globalThis)[K]]
  >
}
type HostCallFuncs = {
  [K in keyof HostCallFuncsMap as HostCallFuncsMap[K][0]]: NonNullable<HostCallFuncsMap[K][1]>
} & {
  hostCall: NonNullable<AnyListen.ExtensionVM.VMContext['__ext_host_call__']>
  key: string
  extension: AnyListen.ExtensionVM.Extension
  hostFuncs: AnyListen.HostFuncs
  clientType: AnyListen_API.ClientType
  platform: AnyListen_API.Platform
  arch: AnyListen_API.Architecture
  locale: AnyListen_API.Locale
  version: string
}

export const hostContext = {} as unknown as HostCallFuncs

export const initState = (
  key: string,
  env: AnyListen.ExtensionVM.Env,
  extension: AnyListen.ExtensionVM.Extension,
  hostFuncs: AnyListen.HostFuncs
) => {
  hostContext.hostCall = globalThis.__ext_host_call__!
  delete globalThis.__ext_host_call__
  hostContext.key = key
  hostContext.extension = extension
  hostContext.hostFuncs = hostFuncs
  hostContext.arch = env.arch
  hostContext.locale = env.locale
  hostContext.clientType = env.clientType
  hostContext.platform = env.platform
  hostContext.version = env.version
  setMessage(env.i18nMessages)

  for (const name of EXTENSION_VM_IPC_FUNC_NAMES) {
    const nativeFunc = globalThis[name]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete globalThis[name]
    // @ts-expect-error
    hostContext[name.replace('__ext_host_call__', '')] = (...args: unknown[]) => {
      for (const arg of args) checkLength(arg)
      // @ts-expect-error
      return nativeFunc(key, ...args)
    }
  }
}
