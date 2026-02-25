import en_us from './langs/en-us.json'
import zh_cn from './langs/zh-cn.json'
import zh_tw from './langs/zh-tw.json'

export type Locale =
  | 'ar-sa'
  | 'cs-cz'
  | 'da-dk'
  | 'de-de'
  | 'el-gr'
  | 'en-au'
  | 'en-gb'
  | 'en-ie'
  | 'en-us'
  | 'en-za'
  | 'es-es'
  | 'es-mx'
  | 'fi-fi'
  | 'fr-ca'
  | 'fr-fr'
  | 'he-il'
  | 'hi-in'
  | 'hu-hu'
  | 'id-id'
  | 'it-it'
  | 'ja-jp'
  | 'ko-kr'
  | 'nl-be'
  | 'nl-nl'
  | 'no-no'
  | 'pl-pl'
  | 'pt-br'
  | 'pt-pt'
  | 'ro-ro'
  | 'ru-ru'
  | 'sk-sk'
  | 'sv-se'
  | 'th-th'
  | 'tr-tr'
  | 'zh-cn'
  | 'zh-hk'
  | 'zh-tw'

const langs = [
  {
    name: '简体中文',
    locale: 'zh-cn',
    // alternate: 'zh-hans',
    country: 'cn',
    fallback: true,
    message: zh_cn,
  },
  {
    name: '繁体中文',
    locale: 'zh-tw',
    // alternate: 'zh-hk',
    country: 'cn',
    message: zh_tw,
  },
  {
    name: 'English',
    locale: 'en-us',
    country: 'us',
    message: en_us,
  },
] as const

type FlattenPairs<T, ValType> = {
  [K in keyof T]: T[K] extends ValType ? [K, T[K]] : FlattenPairs<T[K], ValType>
}[keyof T]
type FlattenMerge<T extends [string, unknown]> = { [P in T as P[0]]: P[1] }

export type Message = FlattenMerge<FlattenPairs<(typeof langs)[number]['message'], string>>

export type Messages = Record<(typeof langs)[number]['locale'], Message>

export type Langs = keyof Messages

const langList: Array<{
  name: string
  locale: keyof Messages
  alternate?: string
}> = []

// @ts-expect-error dynamic init data
const messages: Messages = {}
langs.forEach((item) => {
  langList.push({
    name: item.name,
    locale: item.locale,
    // alternate: item.alternate,
  })
  messages[item.locale] = item.message
})

export { langList, messages }

export type TranslateValues = Record<string, string | number | boolean>

export const fillMessage = (message: string, vals: TranslateValues): string => {
  for (const [key, val] of Object.entries(vals)) {
    message = message.replaceAll(`{${key}}`, String(val))
  }
  return message
}
