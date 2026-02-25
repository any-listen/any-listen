import { DEFAULT_LANG } from '@any-listen/common/constants'
import type { Locale } from '@any-listen/i18n'
import { mirrorRequest } from '@any-listen/nodejs/mirrorReuqest'

import { extensionState } from '../state'
import { setMessages, t } from './i18n'

const API_URL = 'https://raw.githubusercontent.com/any-listen/any-listen-extension-store/main/datas'

let datas = {
  tags: null as AnyListen.IPCExtension.OnlineTagResult | null,
  categories: null as AnyListen.IPCExtension.OnlineCategorieResult | null,
  list: null as AnyListen.IPCExtension.OnlineListItem[] | null,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  i18nMessages: {} as Partial<Record<Locale, Record<string, string>>>,
  i18nLocale: '' as Locale | '',
  i18nPromise: null as Promise<void> | null,
}

const getRemoteI18nMessages = async (lang: Locale) => {
  if (!datas.i18nMessages[lang]) {
    let { body, statusCode } = await mirrorRequest<Record<string, string> | null>(`${API_URL}/i18n/${lang}.json`)
    if (statusCode == 404) {
      body = {} // No i18n data for this locale, return empty object
    } else if (statusCode == 200) {
      if (!body || typeof body !== 'object' || Object.values(body).some((val) => typeof val !== 'string')) {
        body = {} // Invalid i18n data, set empty object
      }
    } else throw new Error(`Failed to fetch i18n data for ${lang}: ${statusCode}`)
    datas.i18nMessages[lang] = body
  }
  return datas.i18nMessages[lang]
}

const initI18nMessages = async () => {
  if (!datas.i18nPromise || datas.i18nLocale != extensionState.locale) {
    const currentLocale = extensionState.locale
    datas.i18nLocale = currentLocale
    datas.i18nPromise = Promise.all([getRemoteI18nMessages(DEFAULT_LANG), getRemoteI18nMessages(extensionState.locale)])
      .then(([fallback, target]) => {
        if (datas.i18nLocale != currentLocale) throw new Error('Locale changed during fetching i18n messages')
        setMessages(currentLocale, { ...fallback, ...target })
      })
      .catch((err) => {
        datas.i18nPromise = null
        throw err
      })
  }
  return datas.i18nPromise
}

const getRemoteOnlineTags = async (): Promise<AnyListen.IPCExtension.OnlineTagResult> => {
  if (!datas.tags) {
    const { body } = await mirrorRequest<AnyListen.IPCExtension.OnlineTagResult | null>(`${API_URL}/tags.json`)

    if (!body || !Array.isArray(body)) throw new Error('Invalid tags data')
    if (body.length) {
      if (typeof body[0]?.id != 'string' || typeof body[0]?.name != 'string') throw new Error('Invalid tags data')
    }
    datas.tags = body
  }
  return datas.tags
}

export const getOnlineTags = async (): Promise<AnyListen.IPCExtension.OnlineTagResult> => {
  const [datas] = await Promise.all([getRemoteOnlineTags(), initI18nMessages()])

  return datas.map((item) => {
    return { ...item, name: t(item.name, item.id) }
  })
}

const getRemoteOnlineCategories = async (): Promise<AnyListen.IPCExtension.OnlineCategorieResult> => {
  if (!datas.categories) {
    const { body } = await mirrorRequest<AnyListen.IPCExtension.OnlineCategorieResult | null>(`${API_URL}/categories.json`)

    if (!body || !Array.isArray(body)) throw new Error('Invalid categories data')
    if (body.length) {
      if (typeof body[0]?.id != 'string' || typeof body[0]?.name != 'string') throw new Error('Invalid categories data')
    }
    datas.categories = body
  }
  return datas.categories
}
export const getOnlineCategories = async (): Promise<AnyListen.IPCExtension.OnlineCategorieResult> => {
  const [datas] = await Promise.all([getRemoteOnlineCategories(), initI18nMessages()])

  return datas.map((item) => {
    return { ...item, name: t(item.name, item.id) }
  })
}

const getList = async (): Promise<AnyListen.IPCExtension.OnlineListItem[]> => {
  if (!datas.list) {
    const { body } = await mirrorRequest<{ all: AnyListen.IPCExtension.OnlineListItem[] } | null>(`${API_URL}/list.json`)

    if (!body || !Array.isArray(body.all)) throw new Error('Invalid list data')
    if (body.all.length) {
      if (typeof body.all[0]?.id != 'string' || typeof body.all[0]?.name != 'string') throw new Error('Invalid list data')
    }
    datas.list = body.all
  }
  return datas.list
}

export const getOnlineExtensionList = async (
  filter: AnyListen.IPCExtension.OnlineListFilterOptions
): Promise<AnyListen.IPCExtension.OnlineListResult> => {
  const [list] = await Promise.all([getList(), initI18nMessages()])

  return {
    total: list.length,
    page: filter.page,
    limit: filter.limit,
    list: list.slice((filter.page - 1) * filter.limit, filter.page * filter.limit).map((item) => {
      if (item.description) return { ...item, description: t(item.description, item.id) }
      return item
    }),
  }
}

export const getOnlineExtensionDetail = async (id: string) => {
  const resp = await mirrorRequest<AnyListen.IPCExtension.OnlineDetail>(`${API_URL}/registry/${id}.json`)
  if (resp.statusCode == 404) return null
  if (resp.statusCode !== 200) throw new Error(`Failed to fetch extension detail for ${id}: ${resp.statusMessage}`)
  return resp.body
}

// TODO
export const resetOnlineData = () => {
  datas.categories = null
  datas.tags = null
  datas.list = null
  datas.i18nMessages = {}
  datas.i18nLocale = ''
  datas.i18nPromise = null
}

export const initOnlineList = async () => {
  try {
    await getList()
    // TODO: check update
  } catch {
    if (import.meta.env.DEV) console.error('Failed to fetch online extension list')
    setTimeout(initOnlineList, 5000)
  }
}
