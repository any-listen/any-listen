import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import colors from 'picocolors'
// import del from 'del'
import { debounce } from '@any-listen/common/utils'
import { Arch, buildConfig, replaceLib, runDesktop } from '@any-listen/desktop'
import Spinnies from 'spinnies'
import type { Logger } from 'vite'
import { type TaksName, buildSuatus, runBuildWorkerStatus } from './utils'

import treeKill from 'tree-kill'
import copyAssets from './copyAssets'
import { dynamicImport } from './import-esm.cjs'
import type { Vite } from './types'

let logger: Logger

// del.sync(['dist/**'])

const logs = [
  'Manifest version 2 is deprecated, and support will be removed in 2023',
  '"Extension server error: Operation failed: Permission denied", source: devtools://devtools/bundled',

  // https://github.com/electron/electron/issues/32133
  '"Electron sandbox_bundle.js script failed to run"',
  '"TypeError: object null is not iterable (cannot read property Symbol(Symbol.iterator))",',
]
function desktopLog(data: Buffer, color: 'red' | 'blue') {
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
  let desktopProcess: ChildProcessWithoutNullStreams | undefined
  const runDesktopDelay = debounce(() => {
    desktopProcess = runDesktop(desktopLog)
  }, 200)

  const noop = () => {}
  const handleUpdate = () => {
    logger.info(colors.green('\nrebuild the desktop main process successfully'))

    if (desktopProcess) {
      desktopProcess.removeAllListeners()
      treeKill(desktopProcess.pid!)
    }
    runDesktopDelay()

    logger.info(colors.green('\nrestart desktop app...'))
  }

  const spinners = new Spinnies({ color: 'blue' })
  spinners.add('view-main', { text: 'view-main compiling' })
  // spinners.add('renderer-lyric', { text: 'renderer-lyric compiling' })
  // spinners.add('renderer-scripts', { text: 'renderer-scripts compiling' })
  spinners.add('desktop', { text: 'desktop compiling' })
  spinners.add('extension-preload', { text: 'extension-preload compiling' })
  const handleResult = (name: TaksName) => {
    return (success: boolean) => {
      if (success) {
        spinners.succeed(name, { text: `${name} compile success!` })
      } else {
        spinners.fail(name, { text: `${name} compile fail!` })
      }
      return success
    }
  }

  const buildTasks = [
    runBuildWorkerStatus('view-main', noop).then(handleResult('view-main')),
    // runBuildWorkerStatus('renderer-lyric', noop).then(handleResult('renderer-lyric')),
    // runBuildWorkerStatus('renderer-scripts', handleUpdate).then(handleResult('renderer-scripts')),
    runBuildWorkerStatus('extension-preload', handleUpdate).then(handleResult('extension-preload')),
    replaceLib({ desktopPlatformName: process.platform, arch: Arch[process.arch as keyof typeof Arch] }).then(async () => {
      return buildSuatus(buildConfig('desktop'), handleUpdate).then(handleResult('desktop'))
    }),
  ]

  if (!(await Promise.all(buildTasks).then((result) => result.every((s) => s)))) return
  // listr.run().then(() => {
  await copyAssets('desktop')
  desktopProcess = runDesktop(desktopLog)

  logger.info(colors.green('\nAll task build successfully'))
  // })
  console.timeEnd('init')
}

void runMainThread()
