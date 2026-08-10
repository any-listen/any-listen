import chokidar from 'chokidar'
import type { EventName } from 'chokidar/handler.js'

import { isMusicFile } from './music'

export type FileAction = Extract<EventName, 'add' | 'change' | 'unlink'>
// export type FileAction = 'add' | 'change' | 'unlink'
export const watchMusicDir = (
  dir: string,
  logger: AnyListen.Logger,
  callback: (action: FileAction, path: string, ctimeMs?: number, mtimeMs?: number, size?: number) => void,
  onReady: () => void,
  onError: (message: string) => void,
  options: {
    recursive?: boolean
    persistent?: boolean
    usePolling?:
      | false
      | {
          interval?: number
          binaryInterval?: number
        }
  } = {}
) => {
  logger.debug(
    `[Watcher]Watching. recursive: ${options.recursive ? 'yes' : 'no'}, usePolling: ${options.usePolling ? 'yes' : 'no'}, dir: [${dir}]`
  )
  const watcher = chokidar.watch(dir, {
    ignored: (filePath, stats) => {
      if (stats && !stats.isDirectory() && !isMusicFile(filePath, true)) {
        return true
      }
      return false
    },
    persistent: options.persistent ?? true,
    ignoreInitial: false,
    depth: options.recursive ? 5 : 0,
    ...(options.usePolling
      ? {
          usePolling: true,
          interval: options.usePolling.interval ?? 1000,
          binaryInterval: options.usePolling.binaryInterval ?? 2000,
        }
      : { usePolling: false }),
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 200,
    },
    atomic: 300,
  })

  let ready = false
  let counts: Partial<Record<EventName, number>> = {}
  watcher.on('all', (event, path, stats) => {
    // console.log(path, stats)
    // console.log(`File ${event}: ${path}`)
    if (!ready) counts[event] = (counts[event] ?? 0) + 1
    callback(event as FileAction, path, stats?.ctimeMs, stats?.mtimeMs, stats?.size)
  })

  watcher.on('ready', () => {
    logger.debug(
      `[Watcher]Ready. ${Object.entries(counts)
        .map(([event, count]) => `${event}: ${count}`)
        .join(', ')}. dir: [${dir}]`
    )
    const watched = Object.entries(watcher.getWatched()).map(([dir, files]) => `[${dir}]: ${files.length}`)
    logger.debug(`[Watcher]Watched: ${JSON.stringify(watched)}`)
    ready = true
    counts = {}
    onReady()
  })

  watcher.on('error', (error) => {
    logger.error(`[Watcher]Error. dir: [${dir}], ${error instanceof Error ? error.message : String(error)}`)
    onError(error instanceof Error ? error.message : String(error))
  })

  return async () => {
    await watcher.close()
  }
}
