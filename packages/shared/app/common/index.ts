import { generateId } from '@any-listen/common/utils'
import type { Message, TranslateValues } from '@any-listen/i18n'
import { removeFile } from '@any-listen/nodejs'

let platformEnv: {
  getSettings: () => AnyListen.AppSetting
  showMessageBox: (key: string, options: AnyListen.IPCCommon.MessageDialogOptions) => Promise<number>
  translate: (key: keyof Message, val?: TranslateValues) => string
  logger: AnyListen.Logger
  trashItem?: (filePath: string) => Promise<void>
}

export const initCommon = (options: typeof platformEnv) => {
  platformEnv = options
}

export const getSettings = (): AnyListen.AppSetting => {
  return platformEnv.getSettings()
}

export const showMessageBox = async (options: AnyListen.IPCCommon.MessageDialogOptions) => {
  return platformEnv.showMessageBox(generateId(), options)
}

export const t = (key: keyof Message, val?: TranslateValues) => {
  return platformEnv.translate(key, val)
}

export const logger: AnyListen.Logger = {
  debug(message, ...args) {
    platformEnv.logger.debug(message, ...args)
  },
  info: (message, ...args) => {
    platformEnv.logger.info(message, ...args)
  },
  warn: (message, ...args) => {
    platformEnv.logger.warn(message, ...args)
  },
  error: (message, ...args) => {
    platformEnv.logger.error(message, ...args)
  },
}

export const deleteFile = async (filePath: string) => {
  if (import.meta.env.VITE_IS_DESKTOP) {
    if (getSettings()['common.enableTrash']) {
      await platformEnv.trashItem!(filePath)
      return
    }
  }
  await removeFile(filePath)
}
