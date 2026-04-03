import SingleEvent from '@any-listen/web/SimpleSingleEvent'
import { derived, writable } from 'svelte/store'
const $messages = writable<Record<string, string>>({})

export const extI18n = {
  message: {} as unknown as Record<string, string>,
  cache: new Map<string, string>(),
  setMessage(messages: Record<string, string>) {
    $messages.set(messages)
    this.message = messages
    this.cache.clear()
    extI18nMessageChangedEvent.emit()
  },
  getMessage(extenstionId: string, transKey: string): string {
    const cacheKey = `${extenstionId}_${transKey}`
    let str = this.cache.get(cacheKey)
    if (str != null) return str
    if (transKey.startsWith('t(')) transKey = `{${transKey.substring(2, transKey.length - 1)}}`
    str = transKey.replace(/{([\w-.]+)}/g, (_, k) => {
      const key = `${extenstionId}.${k}`
      return this.message[key] ?? k
    })
    this.cache.set(cacheKey, str)
    return str
  },
  t(extenstionId: string, key: string): string {
    return this.getMessage(extenstionId, key)
  },
}

const buildMessages = (extensions: AnyListen.Extension.Extension[]) => {
  const messages: Record<string, string> = {}
  for (const ext of extensions) {
    for (const [key, val] of Object.entries(ext.i18nMessages)) {
      messages[`${ext.id}.${key}`] = val
    }
  }
  return messages
}
export const setMessages = (extensions: AnyListen.Extension.Extension[]) => {
  extI18n.setMessage(buildMessages(extensions))
}

export const extT = derived($messages, () => extI18n.getMessage.bind(extI18n))

export const extI18nMessageChangedEvent = new SingleEvent()
