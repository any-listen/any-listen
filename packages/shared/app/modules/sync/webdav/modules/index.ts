import { getSettings } from '../../../../common'
import { logs } from '../../../logs'
import type { WebDAV } from '../webdav'
import { runSyncDislike } from './dislike'
import { runSyncList } from './list'

export interface SyncOptions {
  onEnd: (error?: Error) => void
  getListMergeMode?: () => Promise<AnyListen.List.MergeMode>
  getDislikeMergeMode?: () => Promise<AnyListen.Dislike.MergeMode>
}

const wrapMergeMode = <T extends SyncOptions['getListMergeMode' | 'getDislikeMergeMode'] | undefined>(
  fn: T,
  webDAV: WebDAV
): T => {
  if (!fn) return undefined as T
  return (async () => {
    const mode = await fn()
    if (mode !== 'cancel') {
      if (!(await webDAV.checkCurrentLock())) throw new Error('Lock file is missing, sync cancelled')
    }
    return mode
  }) as T
}
export const runSync = (webDAV: WebDAV, options: SyncOptions) => {
  const settings = getSettings()
  const syncTasks: Array<(webDAV: WebDAV) => Promise<void>> = []
  if (settings['sync.webdav.syncEnable.list']) {
    syncTasks.push(async () => runSyncList(webDAV, wrapMergeMode(options.getListMergeMode, webDAV)))
  }
  if (settings['sync.webdav.syncEnable.dislike']) {
    syncTasks.push(async () => runSyncDislike(webDAV, wrapMergeMode(options.getDislikeMergeMode, webDAV)))
  }

  if (!syncTasks.length) {
    options.onEnd()
    return
  }

  let cancelled = false
  const cancel = () => {
    cancelled = true
  }
  const runNextTask = async (index: number) => {
    if (index >= syncTasks.length || cancelled) {
      options.onEnd(cancelled ? new Error('cancel') : undefined)
      return
    }
    try {
      await syncTasks[index](webDAV)
      void runNextTask(index + 1)
    } catch (error) {
      logs.WebdavSync.logcat.error('Sync task error:', error)
      options.onEnd(error as Error)
    }
  }
  void runNextTask(0)

  return cancel
}
