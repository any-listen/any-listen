/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
type AllActions = AnyListen.ExtensionVM.HostCallActions

type HostCallData = {
  [K in keyof AllActions as AllActions[K] extends undefined ? never : K]: AllActions[K]
}
type HostCallEmptyData = {
  [K in keyof AllActions as AllActions[K] extends undefined ? K : never]: AllActions[K]
}

// declare function _HostCall<T extends keyof HostCallEmptyData>(action: T): void
declare function _HostCall<T extends keyof HostCallData>(action: T, data?: HostCallData[T]): void

declare global {
  const HostCall: typeof _HostCall

  var env_setup: AnyListen.ExtensionVM.VMContext['env_setup']
  var __ext_host_call__: AnyListen.ExtensionVM.VMContext['__ext_host_call__']
  var __ext_host_call__set_timeout: AnyListen.ExtensionVM.VMContext['__ext_host_call__set_timeout']
  var __ext_host_call__clear_timeout: AnyListen.ExtensionVM.VMContext['__ext_host_call__clear_timeout']
  var __ext_host_call__set_interval: AnyListen.ExtensionVM.VMContext['__ext_host_call__set_interval']
  var __ext_host_call__clear_interval: AnyListen.ExtensionVM.VMContext['__ext_host_call__clear_interval']
  var __ext_host_call__utils_str2b64: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_str2b64']
  var __ext_host_call__utils_b642buf: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_b642buf']
  var __ext_host_call__utils_str2md5: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_str2md5']
  var __ext_host_call__utils_aes_encrypt: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_aes_encrypt']
  var __ext_host_call__utils_rsa_encrypt: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_rsa_encrypt']
  var __ext_host_call__utils_iconv_decode: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_iconv_decode']
  var __ext_host_call__utils_iconv_encode: AnyListen.ExtensionVM.VMContext['__ext_host_call__utils_iconv_encode']
}

export {}
