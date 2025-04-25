import { EXTENSION, EXTENSION_VM_IPC_FUNC_NAMES } from '@any-listen/common/constants'
import { randomUUID } from '@any-listen/nodejs'
import { createSimpleLogcat } from '@any-listen/nodejs/logs'
import { createMessage2Call } from 'message2call'
import vm from 'node:vm'
import { createExposeObject } from './apis/exposeFuncs'
import {
  clearExtensionTimeout,
  clear_interval,
  clear_timeout,
  handlePreloadCall,
  set_interval,
  set_timeout,
  utils_aes_encrypt,
  utils_b642buf,
  utils_iconv_decode,
  utils_iconv_encode,
  utils_rsa_encrypt,
  utils_str2b64,
  utils_str2md5,
} from './hostFuncs'
import { contextState } from './state'

type HostCallFuncs = {
  [K in (typeof EXTENSION_VM_IPC_FUNC_NAMES)[number]]: NonNullable<AnyListen.ExtensionVM.VMContext[K]>
}

export const createContext = async (extension: AnyListen.Extension.Extension) => {
  const key = randomUUID()
  const id = extension.id

  const msg2call = createMessage2Call<AnyListen.PreloadFuncs>({
    exposeObj: createExposeObject(extension),
    isSendErrorStack: true,
    timeout: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendMessage(data: any) {
      // console.log('sendMessage', data)
      vmContext.__ext_preload__!(key, 'message', data as string)
    },
  })

  const context: HostCallFuncs = {
    __ext_host_call__set_timeout(...args) {
      set_timeout(id, ...args)
    },
    __ext_host_call__clear_timeout: clear_timeout,
    __ext_host_call__set_interval(...args) {
      set_interval(id, ...args)
    },
    __ext_host_call__clear_interval: clear_interval,
    __ext_host_call__utils_str2b64: utils_str2b64,
    __ext_host_call__utils_b642buf: utils_b642buf,
    __ext_host_call__utils_str2md5: utils_str2md5,
    __ext_host_call__utils_aes_encrypt: utils_aes_encrypt,
    __ext_host_call__utils_rsa_encrypt: utils_rsa_encrypt,
    __ext_host_call__utils_iconv_decode: utils_iconv_decode,
    __ext_host_call__utils_iconv_encode: utils_iconv_encode,
  }
  for (const name of EXTENSION_VM_IPC_FUNC_NAMES) {
    const rawFn = context[name]
    // @ts-expect-error
    context[name] = (_key, ...args: unknown[]) => {
      if (_key != key) throw new Error('host call illegal')
      // @ts-expect-error
      return rawFn(...args)
    }
  }
  const logcat = await createSimpleLogcat(extension.dataDirectory, EXTENSION.logFileName)
  const vmContext = vm.createContext(
    {
      ...context,
      __ext_host_call__(_key, action, data) {
        if (key != _key) throw new Error('host call illegal')
        if (action == 'message') {
          // console.log('mssage', data)
          msg2call.message(data)
          return
        }
        if (data) {
          handlePreloadCall(action, JSON.parse(data) as AnyListen.ExtensionVM.HostCallActions[typeof action], logcat)
        }
        // else handlePreloadCall(action, undefined)
      },
    } satisfies AnyListen.ExtensionVM.VMContext,
    {
      codeGeneration: {
        strings: false,
        wasm: false,
      },
    }
  ) as AnyListen.ExtensionVM.VMContext
  const vmContextInfo = {
    extension,
    key,
    vmContext,
    preloadFuncs: msg2call.remote,
    unsubscribeEvents: [],
    logcat,
  }
  contextState.vmContexts.set(id, vmContextInfo)
  return vmContextInfo
}

export const destroyContext = async (id: string) => {
  clearExtensionTimeout(id)
  const vmState = contextState.vmContexts.get(id)
  if (!vmState) return
  for (const unsub of vmState.unsubscribeEvents) unsub()
  contextState.vmContexts.delete(id)
}
