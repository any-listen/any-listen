import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import { env } from 'node:process'

import { minify } from '@swc/html'

/**
 * HTML plugin for Vite that allows injecting data and tags into the HTML.
 *
 * @typedef {Object} Options
 * @property {boolean} [minify] - Whether to minify the HTML.
 * @property {boolean} [scriptCSPHash] - Whether add script CSP Hash.
 * @property {Object} [inject] - Injection options.
 * @property {Record<string, any>} [inject.data] - Data to inject into the HTML.
 * @property {Array<import('vite').HtmlTagDescriptor | null | false | undefined>} [inject.tags] - Tags to inject into the HTML.
 *
 * @param {Options} [options] - Plugin options.
 * @param {Object} [options.inject] - Injection options.
 * @param {Record<string, any>} [options.inject.data] - Data to inject into the HTML.
 * @param {Array<import('vite').HtmlTagDescriptor | null | false | undefined>} [options.inject.tags] - Tags to inject into the HTML.
 * @returns {import('vite').Plugin} Vite plugin configuration.
 */

/**
 *
 * @param {string} html
 * @param {import('vite').HtmlTagDescriptor[]} tags
 */
const createHash256 = (html, tags) => {
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g
  const hashs = []
  let match
  // 遍历所有匹配的 <script> 标签
  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1]
    const hash = crypto.createHash('sha256').update(Buffer.from(scriptContent)).digest('base64')
    hashs.push(hash)
  }
  const csp = tags.find((t) => t.tag == 'meta' && t.attrs?.['http-equiv'] == 'Content-Security-Policy')
  if (!csp || !hashs.length) return [html, tags]
  csp.attrs.content += ` 'sha256-${hashs.join("' 'sha256-")}'`
  return [html, tags]
}
/**
 *
 * @param {Options} [options]
 * @returns {import('vite').Plugin[]}
 */
export const createHtmlPlugin = (options = {}) => {
  const isProd = env.NODE_ENV == 'production'
  return [
    {
      name: 'inject-html',
      transformIndexHtml: {
        order: 'pre',
        handler: async (html) => {
          let { data = {} } = options.inject || {}
          html = html.replace(/(?:\/\/)?<%-\s*(\w+)\s*%>/g, (_, key) => {
            return data[key]
          })
          return html
        },
      },
    },
    {
      name: 'minify-html',
      transformIndexHtml: {
        order: 'post',
        handler: async (html) => {
          let { tags = [] } = options.inject || {}
          if (options.minify && isProd) {
            html = (
              await minify(html, {
                collapseWhitespaces: 'all',
                minifyCss: true,
                minifyJs: true,
                minifyJson: true,
                quotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: 'all',
                tagOmission: false,
              })
            ).code
          }
          tags = tags.filter(Boolean)
          if (options.scriptCSPHash) {
            ;[html, tags] = createHash256(html, tags)
          }

          // https://github.com/wojtekmaj/vite-plugin-simple-html/blob/832616509c6f844fa5394c141fa99c15d39f9045/src/htmlPlugin.ts#L35
          for (const tag of tags.toReversed()) {
            const { tag: tagName, attrs, injectTo = 'head-prepend' } = tag

            let tagString = `<${tagName}${
              attrs
                ? ` ${Object.entries(attrs || {})
                    .map(([key, value]) => `${key}="${value}"`)
                    .join(' ')}`
                : ''
            }>`
            if (tagName !== 'link' && tagName !== 'meta') {
              tagString += `</${tagName}>`
            }

            switch (injectTo) {
              case 'head':
                html = html.replace(/<\/head>/, `${tagString}</head>`)
                break
              case 'head-prepend':
                html = html.replace(/<head>/, `<head>${tagString}`)
                break
              case 'body':
                html = html.replace(/<\/body>/, `${tagString}</body>`)
                break
              case 'body-prepend':
                html = html.replace(/<body>/, `<body>${tagString}`)
                break
              default:
                throw new Error(`Unknown injectTo value: ${injectTo}`)
            }
          }
          return html
        },
      },
    },
  ]
}
