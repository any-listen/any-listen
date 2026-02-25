import fs from 'node:fs'
import path from 'node:path'

import type Router from '@koa/router'

export const registerDevRouter = (router: Router<unknown, AnyListen.RequestContext>) => {
  const ipcFiles = ['view-main.ipc']

  for (const file of ipcFiles) {
    const jsFile = `${file}.js`
    const mapFile = `${file}.js.map`
    router.get(`/${jsFile}`, async (ctx, next) => {
      let script = (await fs.promises.readFile(path.join(__dirname, jsFile))).toString()
      ctx.set('Content-Type', 'text/javascript')
      ctx.body = script
    })
    router.get(`/${mapFile}`, async (ctx, next) => {
      let scriptMap = (await fs.promises.readFile(path.join(__dirname, mapFile))).toString()
      ctx.body = scriptMap
    })
  }
}
