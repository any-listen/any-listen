export interface VMState {
  extension: AnyListen.Extension.Extension
  key: string
  vmContext: AnyListen.ExtensionVM.VMContext
  preloadFuncs: AnyListen.PreloadFuncs
  unsubscribeEvents: Array<() => void>
  logcat: (message: string) => void
}

export const contextState = {
  vmContexts: new Map<string, VMState>(),
}
