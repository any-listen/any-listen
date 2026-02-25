import { createProxyCallback } from 'message2call'

import { extensionState } from '../state'
import { cloneData } from './shared'

export const createCommon = (extension: AnyListen.Extension.Extension) => {
  return {
    async showMessageBox(key: string, options: AnyListen.IPCCommon.MessageDialogOptions) {
      const data = await extensionState.remoteFuncs.showMessageBox(key, extension.id, cloneData(options))
      return cloneData(data)
    },
    async showInputBox(key: string, { validateInput, ...opts }: AnyListen.IPCCommon.InputDialogOptions) {
      const validateInputCallback = validateInput ? createProxyCallback(validateInput) : undefined
      const data = await extensionState.remoteFuncs
        .showInputBox(key, extension.id, cloneData(opts), validateInputCallback)
        .finally(() => {
          validateInputCallback?.releaseProxy()
        })
      return cloneData(data)
    },
    async showOpenBox(key: string, options: AnyListen.IPCCommon.OpenDialogOptions) {
      const data = await extensionState.remoteFuncs.showOpenBox(key, extension.id, cloneData(options))
      return cloneData(data)
    },
    async showSaveBox(key: string, options: AnyListen.IPCCommon.SaveDialogOptions) {
      const data = await extensionState.remoteFuncs.showSaveBox(key, extension.id, cloneData(options))
      return cloneData(data)
    },
    async closeMessageBox(key: string) {
      return extensionState.remoteFuncs.closeMessageBox(key)
    },
  } as const
}
