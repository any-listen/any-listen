import { DEFAULT_LANG } from '@any-listen/common/constants'

const fillMessage = (message: string, vals: Record<string, string | number | null | undefined>): string => {
  for (const [key, val] of Object.entries(vals)) {
    message = message.replaceAll(`{${key}}`, String(val))
  }
  return message
}

const i18n = {
  locale: DEFAULT_LANG as string,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  message: {} as Record<string, string>,
  setMessage(message: Record<string, string>) {
    this.message = message
  },
  getMessage(key: string, val?: Record<string, string | number | null | undefined>): string {
    let targetMessage = this.message[key] ?? key
    return val ? fillMessage(targetMessage, val) : targetMessage
  },
}

export const setMessage = (message: Record<string, string>) => {
  i18n.setMessage(message)
}
export const translate = (key: string, val?: Record<string, string | number | null | undefined>) => {
  return i18n.getMessage(key, val)
}
