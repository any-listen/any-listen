import path from 'node:path'
import type { UserConfig } from 'vite'
import { MessageChannel, Worker } from 'worker_threads'

import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'

export type BuildSuatus = 'success' | 'error' | 'updated'
export type TaksName = 'desktop' | 'web-server' | 'web-preload' | 'view-main' | 'extension-preload'
export type Target = 'desktop' | 'web' | 'mobile'

/**
 * build code
 * @param config vite config
 * @param onUpdated new build event
 * @returns is success
 */
export const build = async (config: UserConfig, onUpdated: () => void): Promise<{ status: boolean; reload: () => void }> => {
  const { build: viteBuild } = (await dynamicImport('vite')) as typeof Vite
  if (process.env.NODE_ENV === 'production') {
    if (config.build) config.build.watch = null
    return viteBuild({ ...config, configFile: false })
      .then((output) => {
        // output
        // console.log(output)
        return { status: true, reload: () => {} }
      })
      .catch((error) => {
        console.log(error)
        return { status: false, reload: () => {} }
      })
  }

  return config.server ? createBuildServer(config, onUpdated) : buildDev(config, onUpdated)
}

/**
 * build code in dev
 * @param config vite config
 * @param onUpdated new build event
 * @returns is success
 */
const buildDev = async (config: UserConfig, onUpdated: () => void) => {
  const { build: viteBuild, mergeConfig } = (await dynamicImport('vite')) as typeof Vite

  return new Promise<{ status: boolean; reload: () => void }>((resolve) => {
    let firstBundle = true
    let isError = false
    config = mergeConfig(config, {
      plugins: [
        {
          name: 'vite:file-watcher',
          buildEnd(err?: Error) {
            // console.log('buildEnd', err !== undefined, err)
            isError = err !== undefined
          },
          closeBundle() {
            // console.log('closeBundle')
            if (firstBundle) {
              firstBundle = false
              resolve({ status: !isError, reload: () => {} })
            } else {
              if (isError) return
              onUpdated()
            }
          },
        },
      ],
    })

    void viteBuild({ ...config, configFile: false })
  })
}

export const createBuildServer = async (config: UserConfig, onUpdated: () => void) => {
  const { mergeConfig, createServer } = (await dynamicImport('vite')) as typeof Vite

  return new Promise<{ status: boolean; reload: () => void }>((resolve) => {
    let firstBundle = true
    let isError = false
    void createServer({
      ...mergeConfig(config, {
        plugins: [
          {
            name: 'vite:file-watcher',
            buildEnd(err?: Error) {
              // console.log('buildEnd', err !== undefined, err)
              isError = err !== undefined
            },
            closeBundle() {
              // console.log('closeBundle')
              if (firstBundle) {
                firstBundle = false
                // resolve(!isError)
              } else {
                if (isError) return
                onUpdated()
              }
            },
          },
        ],
      }),
      configFile: false,
    })
      .then(async (server) => {
        return server.listen().then(() => {
          resolve({
            status: true,
            reload() {
              server.hot.send({
                type: 'full-reload',
              })
            },
          })
        })
      })
      .catch((error) => {
        console.log(error)
        resolve({
          status: false,
          reload() {},
        })
      })

    // return build(config, () => {
    // // server.ws.send({ type: 'full-reload' })
    //   onUpdated()
    // })
  })
}

/**
 * build code in worker
 * @param config vite config
 * @param onUpdated new build event
 * @returns is success
 */
export const runBuildWorker = async (taskName: TaksName, onUpdated: () => void) =>
  new Promise<{ status: boolean; reload: () => void }>((resolve) => {
    const worker = new Worker(path.resolve(__dirname, './worker.ts'), {
      execArgv: ['--require', 'ts-node/register'],
    })
    const subChannel = new MessageChannel()
    const result = {
      status: false,
      reload() {
        worker.postMessage('reload')
      },
    }
    worker.postMessage({ port: subChannel.port1, taskName, target: process.env.MODE }, [subChannel.port1])
    subChannel.port2.on('message', ({ status }: { status: BuildSuatus }) => {
      // console.log(status)
      switch (status) {
        case 'updated':
          onUpdated()
          break
        case 'success':
          result.status = true
          resolve(result)
          break
        case 'error':
          result.status = false
          resolve(result)
          break
      }
    })
  })

export const buildSuatus = async (config: UserConfig, onUpdated: () => void) => {
  return build(config, onUpdated).then(({ status }) => status)
}

export const runBuildWorkerStatus = async (taskName: TaksName, onUpdated: () => void) => {
  return runBuildWorker(taskName, onUpdated).then(({ status }) => status)
}
