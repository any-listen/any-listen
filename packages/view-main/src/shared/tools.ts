import type { DOMPurify } from 'dompurify'

import { workers } from '@/worker'

import { runTimeout, stopTimeout } from './browser/tools'

export const sanitizeHtml = (DOMPurify: DOMPurify, str?: string) => {
  if (!str || typeof str !== 'string') return ''
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [
      'b',
      'q',
      'br',
      'i',
      'u',
      's',
      'strong',
      'em',
      'p',
      'span',
      'div',
      'a',
      'code',
      'pre',
      'img',
      'ul',
      'ol',
      'li',
      'blockquote',
      'hr',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: ['style', 'href', 'title', 'alt', 'src', 'width', 'height'],
    // USE_PROFILES: { html: true },
    ALLOW_DATA_ATTR: false,
  })
}

export const parseMarkdown = async (content: string) => {
  const [html, { default: DOMPurify }] = await Promise.all([workers.main.parseMarkdown(content), import('dompurify')])
  if (!html) return null
  try {
    return sanitizeHtml(DOMPurify, html)
  } catch (err) {
    console.error('Markdown parsing error:', err)
    return null
  }
}

export const parseMarkdowns = async (contents: string[]) => {
  const [htmls, { default: DOMPurify }] = await Promise.all([workers.main.parseMarkdowns(contents), import('dompurify')])
  try {
    return htmls.map((html) => (html == null ? null : sanitizeHtml(DOMPurify, html)))
  } catch (err) {
    console.error('Markdown parsing error:', err)
    return null
  }
}

export const setTimeoutBg = (import.meta.env.VITE_IS_DESKTOP ? window.__anylisten_node_env__!.setTimeout : runTimeout) as (
  callback: () => void,
  delay?: number
) => number
export const clearTimeoutBg = (import.meta.env.VITE_IS_DESKTOP ? window.__anylisten_node_env__!.clearTimeout : stopTimeout) as (
  id: number
) => void
