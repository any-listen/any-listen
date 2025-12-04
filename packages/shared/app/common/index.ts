import { generateId } from '@any-listen/common/utils'
import type { Message, TranslateValues } from '@any-listen/i18n'

let commonOptions: {
  getSettings: () => AnyListen.AppSetting
  showMessageBox: (key: string, options: AnyListen.IPCCommon.MessageDialogOptions) => Promise<number>
  translate: (key: keyof Message, val?: TranslateValues) => string
  logger: AnyListen.Logger
}

export const initCommon = (options: typeof commonOptions) => {
  commonOptions = options
}

export const getSettings = (): AnyListen.AppSetting => {
  return commonOptions.getSettings()
}

export const showMessageBox = async (options: AnyListen.IPCCommon.MessageDialogOptions) => {
  return commonOptions.showMessageBox(generateId(), options)
}

export const t = (key: keyof Message, val?: TranslateValues) => {
  return commonOptions.translate(key, val)
}

export const logger: AnyListen.Logger = {
  debug(message, ...args) {
    commonOptions.logger.debug(message, ...args)
  },
  info: (message, ...args) => {
    commonOptions.logger.info(message, ...args)
  },
  warn: (message, ...args) => {
    commonOptions.logger.warn(message, ...args)
  },
  error: (message, ...args) => {
    commonOptions.logger.error(message, ...args)
  },
}
