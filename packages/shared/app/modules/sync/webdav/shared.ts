import { syncWebDAVEvent } from './event'
import { state } from './state'

export const CONSTANTS = {
  listDirectoryName: 'list',
  dislikeDirectoryName: 'dislike',
  snapshotDirectoryName: 'snapshots',
  snapshotListFileName: 'snapshot-list',
  snapshotInfoFileName: 'snapshot-info',
  lockFilePrefix: 'lock-',
} as const

export const sendSyncWebDAVStatus = () => {
  syncWebDAVEvent.statusChanged({ status: state.status, error: state.error?.message, nextSyncTime: state.nextSyncTime })
}
