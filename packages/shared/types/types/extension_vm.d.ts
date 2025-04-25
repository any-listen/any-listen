declare global {
  namespace AnyListen {
    namespace ExtensionVM {
      interface Extension {
        id: string
        name: string
        description: string
        version: string
        author: string
        homepage: string
        grant: Extension.Grant[]
        publicKey: string
      }
      // interface RequestOptions {
      //   method?: 'get'
      //   timeout?: number
      //   headers?: Record<string, string>
      //   body?: string
      //   form?: string
      //   formData?: string
      //   binary?: string
      // }
      // interface Response {
      //   statusCode: number
      //   statusMessage: string
      //   headers: Record<string, string>
      //   raw: number[]
      //   body: string
      // }
      // type StorageActionTypes = AnyListen.IPCAction<'get', string[]>
      // | AnyListen.IPCAction<'set', Array<[string, string]>>
      // | AnyListen.IPCAction<'remove', string[]>
      // | AnyListen.IPCAction<'clear'>

      // call host actions
      type HostCallTypes = IPCAction<'logcat', LogInfo> | IPCAction<'message', unknown> | IPCAction<'connected_client'>

      type HostCallActions = Actions<HostCallTypes>

      // call preload actions
      type PreloadCallTypes = IPCAction<'error', string> | IPCAction<'trigger_timeout', number> | IPCAction<'message', unknown>

      type PreloadCallActions = Actions<PreloadCallTypes>

      type AES_MODE = 'CBC_128_PKCS7Padding' | 'ECB_128_NoPadding'
      type RSA_PADDING = 'RSA_PKCS1_OAEP_PADDING' | 'RSA_NO_PADDING'

      interface Env {
        clientType: ClientType
        platform: 'mac' | 'linux' | 'windows' | 'android' | 'ios'
        arch: 'arm' | 'arm64' | 'x86' | 'x64'
        locale: Locale
        version: string
        i18nMessages: Record<string, string>
      }

      interface VMContext {
        env_setup?: (_key: string, extension: Extension, env: Env) => void
        // preload -> host
        __ext_host_call__?: (_key: string, action: keyof HostCallActions, data?: string) => void
        __ext_host_call__set_timeout?: (id: number, ms: number) => void
        __ext_host_call__clear_timeout?: (id: number) => void
        __ext_host_call__set_interval?: (id: number, ms: number) => void
        __ext_host_call__clear_interval?: (id: number) => void
        __ext_host_call__utils_str2b64?: (data: string) => string
        __ext_host_call__utils_b642buf?: (data: string) => number[]
        __ext_host_call__utils_str2md5?: (data: string) => string
        __ext_host_call__utils_aes_encrypt?: (
          mode: AES_MODE,
          data: Uint8Array | string,
          key: Uint8Array | string,
          iv: Uint8Array | string
        ) => string
        __ext_host_call__utils_rsa_encrypt?: (mode: RSA_PADDING, data: Uint8Array | string, key: Uint8Array | string) => string
        __ext_host_call__utils_iconv_decode?: (data: Uint8Array | Uint16Array, encoding: string) => string
        __ext_host_call__utils_iconv_encode?: (data: string, encoding: string) => Uint8Array

        // host -> preload
        __ext_preload__?: (key: string, action: keyof PreloadCallActions, data?: string) => void
      }
    }
  }
}

export {}
