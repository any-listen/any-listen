import type { Locale } from '@any-listen/i18n'

export interface VersionInfo extends AnyListen.VersionInfo {
  langDescs: Map<Locale, string>
}

export const parseLangDesc = (desc: string) => {
  const langs = new Map<Locale, string>()
  const langTagRxp = /<!---\s*@lang:\s*([\w-]+)\s*-->([\s\S]*?)(?=(?:(?:---\s*)*<!---\s*@lang:)|(?:\r?\n)*$)/g
  let m: RegExpExecArray | null
  while ((m = langTagRxp.exec(desc)) !== null) {
    const key = m[1] as Locale
    const content = m[2].trim()
    langs.set(key, content)
  }

  return langs
}
