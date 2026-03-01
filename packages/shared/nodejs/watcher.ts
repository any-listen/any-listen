import chokidar from 'chokidar'

import { isMusicFile } from './music'

export type FileAction = 'add' | 'change' | 'unlink'
export const watchMusicDir = (
  dir: string,
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
  // console.log(`Start watching music dir: ${dir}, recursive: ${options.recursive ? 'yes' : 'no'}`)
  const watcher = chokidar.watch(dir, {
    ignored: (filePath, stats) => {
      if (stats && !stats.isDirectory() && !isMusicFile(filePath)) {
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

  watcher.on('all', (event, path, stats) => {
    // console.log(path, stats)
    // console.log(`File ${event}: ${path}`)
    callback(event as FileAction, path, stats?.ctimeMs, stats?.mtimeMs, stats?.size)
  })

  watcher.on('ready', () => {
    // console.log(`Initial scan complete. Watching for changes in: ${dir}`)
    onReady()
  })

  watcher.on('error', (error) => {
    console.error('Watcher error:', error)
    onError(error instanceof Error ? error.message : String(error))
  })

  return async () => {
    await watcher.close()
  }
}
