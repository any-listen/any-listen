import { toHtml } from 'hast-util-to-html'
import { refractor } from 'refractor/core'
import log from 'refractor/log'

refractor.register(log)

export const highlightCode = (code: string, lang: 'log') => {
  return toHtml(refractor.highlight(code, lang))
}
