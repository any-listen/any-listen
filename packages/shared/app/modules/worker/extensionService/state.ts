import { DEFAULT_LANG } from '@any-listen/common/constants'

const empty = {}
export const extensionState = {
  version: '1.0.0',
  clientType: '' as AnyListen.ClientType,
  locale: DEFAULT_LANG as AnyListen.Locale,
  onlineExtensionHost: '',
  extensionI18nMessage: empty as Record<string, string>,
  proxy: {
    host: '',
    port: '',
  },
  configFilePath: '',
  extensionDir: '',
  dataDir: '',
  tempDir: '',
  extensions: [] as AnyListen.Extension.Extension[],
  // prettier-ignore
  // vmContexts: new Map<string, {
  //   extension: AnyListen.Extension.Extension
  //   key: string
  //   vmContext: AnyListen.ExtensionVM.VMContext
  // }>(),
  preloadScript: '',
  resourceList: empty as AnyListen.Extension.ResourceList,
  extensionSettings: null as AnyListen.Extension.ExtensionSetting[] | null,
  remoteFuncs: empty as AnyListen.IPCExtension.MainIPCActions & {
    inited: () => void
  },
}
