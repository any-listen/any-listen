import { logs } from '../../logs'
import { runSync } from './modules'
import { sendSyncWebDAVStatus } from './shared'
import { state } from './state'
import { WebDAV, type WebDAVClientOptions } from './webdav'

export interface SyncWebDAVOptions {
  getListMergeMode?: () => Promise<AnyListen.List.MergeMode>
  getDislikeMergeMode?: () => Promise<AnyListen.Dislike.MergeMode>
}

export const runSyncWebDAV = async (options: WebDAVClientOptions, syncOptions?: SyncWebDAVOptions) => {
  if (state.status !== 'idle' && state.status !== 'error') {
    logs.WebdavSync.logcat.warn('WebDAV sync is already running')
    throw new Error('WebDAV sync is already running')
  }
  state.status = 'waiting'
  state.error = undefined
  sendSyncWebDAVStatus()
  const webDAV = new WebDAV(options)
  const error = await webDAV.checkConnection()
  if (error) {
    state.status = 'error'
    state.error = error
    sendSyncWebDAVStatus()
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (state.status !== 'waiting') {
    logs.WebdavSync.logcat.warn('WebDAV sync was cancelled before starting')
    return
  }
  state.cancelTask = webDAV.lock((locked, error) => {
    state.cancelTask = undefined
    if (error) {
      state.status = 'error'
      state.error = error
      sendSyncWebDAVStatus()
      return
    }
    if (!locked) {
      state.status = 'idle'
      sendSyncWebDAVStatus()
      return
    }
    // logs.WebdavSync.logcat.debug('WebDAV locked')
    state.status = 'syncing'
    sendSyncWebDAVStatus()
    state.cancelTask = runSync(webDAV, {
      onEnd: (error) => {
        state.cancelTask = undefined
        state.status = error ? 'error' : 'idle'
        state.error = error
        sendSyncWebDAVStatus()
        void webDAV.unlock()
        logs.WebdavSync.logcat.info('Sync ended,', error ? `with error: ${error.message}` : 'successfully')
      },
      getListMergeMode: syncOptions?.getListMergeMode,
      getDislikeMergeMode: syncOptions?.getDislikeMergeMode,
    })
  })
}
export const cancelSyncWebDAV = () => {
  // console.log('cancel', state.cancelTask, state.status)
  if (state.cancelTask) {
    state.cancelTask()
    return
  }
  if (state.status !== 'idle' && state.status !== 'error') {
    state.status = 'idle'
    state.error = undefined
    sendSyncWebDAVStatus()
  }
}
export const getSyncWebDAVState = () => {
  return {
    status: state.status,
    error: state.error,
    nextSyncTime: state.nextSyncTime,
  }
}
