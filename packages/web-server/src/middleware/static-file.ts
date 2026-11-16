import { API_PREFIX } from '@any-listen/common/constants'
import { joinPath } from '@any-listen/nodejs'

import { PUBLIC_RESOURCE_PATH as _PUBLIC_RESOURCE_PATH } from '@/shared/constants'

import { sendFileStream } from './shared/stream-file'

const maxAge = 60 * 86400
// public static paths are keyed by file path, not content, so the cache must
// stay short enough to pick up replaced local files
const publicResourceMaxAge = 1 * 86400
const PUBLIC_RESOURCE_PATH = `${_PUBLIC_RESOURCE_PATH}/`

let publicDir = joinPath(__dirname, '../public')
if (import.meta.env.DEV) publicDir = joinPath(__dirname, 'public')

export default async (ctx: AnyListen.RequestContext, next: AnyListen.Next): Promise<unknown> => {
  if (ctx.method == 'HEAD' || ctx.method == 'GET') {
    if (ctx.path.startsWith(PUBLIC_RESOURCE_PATH)) {
      const fileName = ctx.path.substring(PUBLIC_RESOURCE_PATH.length)
      const rawPath = global.anylisten.publicStaticPaths.get(fileName)
      if (rawPath) {
        return sendFileStream(ctx, rawPath, {
          hidden: false,
          maxAge: publicResourceMaxAge,
          immutable: false,
          public: true,
        })
      }
    } else if (!ctx.path.startsWith(API_PREFIX)) {
      let path = ctx.path
      if (path.endsWith('/')) path += 'index.html'
      const filePath = joinPath(publicDir, path)
      if (filePath.startsWith(publicDir)) {
        return sendFileStream(
          ctx,
          filePath,
          path.endsWith('.html')
            ? { noCache: true }
            : {
                maxAge,
                immutable: true,
                public: true,
              }
        )
      }
    }
  }
  return next()
}
