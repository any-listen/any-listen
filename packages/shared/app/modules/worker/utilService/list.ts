import { generateId } from '@any-listen/common/utils'
import { type FileAction, watchMusicDir } from '@any-listen/nodejs/watcher'

const watchers = new Map<string, () => Promise<void>>()
export const createMusicDirWatcher = (
  dir: string,
  onFile: (action: FileAction, path: string) => void,
  onReady: () => void,
  onError: (message: string) => void,
  options: { recursive?: boolean; persistent?: boolean; usePolling?: boolean } = {}
) => {
  const id = generateId()
  watchers.set(
    id,
    watchMusicDir(dir, onFile, onReady, onError, {
      ...options,
      usePolling: options.usePolling
        ? {
            interval: 1000,
            binaryInterval: 2000,
          }
        : undefined,
    })
  )
  return id
}
export const removeMusicDirWatcher = async (id: string) => {
  const unwatch = watchers.get(id)
  if (!unwatch) return
  await unwatch()
  watchers.delete(id)
}
