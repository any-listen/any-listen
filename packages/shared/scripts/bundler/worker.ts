import { type MessagePort, parentPort } from 'node:worker_threads'

import { DEV_SERVER_PORTS } from '@any-listen/common/constants'
import type { UserConfig } from 'vite'

import { dynamicImport } from './import-esm.cjs'
import { type Target, type TaskName, build } from './utils'

if (!parentPort) throw new Error('Require run in worker')

const getWebViewMainIpc = () => {
  return process.env.NODE_ENV === 'development' ? 'http://localhost:9500/view-main.ipc.js' : './view-main.ipc.js'
}

type ViewMainTarget = 'desktop' | 'web'
const getViewMainConfig = async (target: Target) => {
  const { buildConfig } = (await dynamicImport('@any-listen/view-main')) as {
    buildConfig: (target: ViewMainTarget, port: number, path: string) => Promise<UserConfig>
  }
  if (target !== 'desktop' && target !== 'web') throw new Error(`Invalid target for view-main: ${target}`)
  return buildConfig(target, DEV_SERVER_PORTS['view-main'], target == 'web' ? getWebViewMainIpc() : '')
}

// const getExtensionPreloadConfig = async (target: Target) => {
//   const { buildConfig } = await dynamicImport('@any-listen/extension-preload/vite.config')
//   return buildConfig(target)
// }

let buildResult: {
  status: boolean
  reload: () => void
}

parentPort.on('message', async ({ port, taskName, target }: { port?: MessagePort; taskName: TaskName; target: Target }) => {
  if (!port) {
    buildResult.reload()
    return
  }
  const configs = {
    desktop: async (mode: Target) => import('@any-listen/desktop').then((m) => m.buildConfig(mode)),
    'web-server': async (mode: Target) => import('@any-listen/web-server').then((m) => m.buildConfig(mode)),
    'web-preload': async (mode: Target) => import('@any-listen/web-server').then((m) => m.buildPreloadConfig(mode)),
    'view-main': getViewMainConfig,
    'extension-preload': async (mode: Target) => {
      return import('@any-listen/extension-preload/vite.config').then((m) => m.buildConfig(mode))
    },
  } as const
  // assert(port instanceof MessagePort)
  const sendStatus = () => {
    port.postMessage({
      status: 'updated',
    })
  }
  void build(await configs[taskName](target), sendStatus).then((result) => {
    buildResult = result
    port.postMessage({
      status: result.status ? 'success' : 'error',
    })
  })
})
