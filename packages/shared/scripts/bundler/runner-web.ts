import type { ChildProcessWithoutNullStreams } from 'node:child_process'

// import del from 'del'
import { DEV_SERVER_PORTS } from '@any-listen/common/constants'
import { buildConfig, runServer } from '@any-listen/web-server'
import colors from 'picocolors'
import type { Logger } from 'vite'

import copyAssets from './copyAssets'
import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'
import { buildSuatus, runBuildWorker, runBuildWorkerStatus, taskTools } from './utils'

let logger: Logger

// del.sync(['dist/**'])
const logs: string[] = []
function serverLog(data: Buffer, color: 'red' | 'blue') {
  let log = data.toString()
  if (/[0-9A-z]+/.test(log)) {
    // 抑制某些无关的报错日志
    if (color == 'red' && typeof log === 'string' && logs.some((l) => log.includes(l))) return

    logger.info(colors[color](log))
  }
}

const runMainThread = async () => {
  console.time('init')
  const { createLogger } = (await dynamicImport('vite')) as typeof Vite
  logger = createLogger('info')

  // let server: ViteDevServer | undefined
  let serverProcess: ChildProcessWithoutNullStreams | undefined

  const noop = () => {}
  const handleUpdate = () => {
    logger.info(colors.green('\nrebuild the web server main process successfully'))

    if (serverProcess) {
      serverProcess.removeAllListeners()
      serverProcess.kill()
    }

    serverProcess = runServer(serverLog)
    logger.info(colors.green('\nrestart web server...'))
  }

  let viewMainBuild: { status: boolean; reload: () => void }
  taskTools.addTask('view-main', async () =>
    runBuildWorker('view-main', noop).then((result) => {
      viewMainBuild = result
      return result.status
    })
  )
  taskTools.addTask('view-lyric', async () =>
    runBuildWorker('view-lyric', noop).then((result) => {
      viewMainBuild = result
      return result.status
    })
  )
  taskTools.addTask('web-preload', async () =>
    runBuildWorkerStatus('web-preload', () => {
      viewMainBuild.reload()
    })
  )
  taskTools.addTask('extension-preload', async () => runBuildWorkerStatus('extension-preload', handleUpdate))
  taskTools.addTask('web-server', async () => buildSuatus(buildConfig('web-server'), handleUpdate))

  await taskTools.runTasks()
  // listr.run().then(() => {
  await copyAssets('web')
  serverProcess = runServer(serverLog)

  // const config = await getViewMainConfig('web-server')
  logger.info(colors.green('\nAll task build successfully'))
  // })
  console.timeEnd('init')
  logger.info(
    colors.yellow(`web UI running: http://localhost:${DEV_SERVER_PORTS['view-main']}
web lyric running: http://localhost:${DEV_SERVER_PORTS['view-lyric']}`)
  )
}

void runMainThread()
