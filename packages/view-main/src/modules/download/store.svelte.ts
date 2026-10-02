import { showNotify } from '@/components/apis/notify'
import { onConnected, onDesconnected, onRelease } from '@/modules/app/shared'
import { i18n } from '@/plugins/i18n'
import { getDownloadSnapshot } from '@/shared/ipc/download'
import { downloadListActionEvent } from '@/shared/ipc/download/event'

import { applyDownloadAction } from './sync'

export const downloadState = $state({
  list: [] as AnyListen.Download.ListItem[],
  revision: 0,
  connected: false,
  loading: false,
  error: '',
})
let generation = 0
let buffered: AnyListen.Download.ListAction[] = []

const update = (action: AnyListen.Download.ListAction) => {
  if (action.revision <= downloadState.revision) return
  if (action.action === 'update') {
    for (const item of action.data) {
      const previous = downloadState.list.find((task) => task.id === item.id)
      if (!previous || previous.status === item.status) continue
      if (item.status === 'error') {
        showNotify(i18n.t('download.failed', { name: item.metadata.musicInfo.name, error: item.statusText }), 6, true)
      } else if (item.status === 'completed') {
        showNotify(
          item.statusText
            ? i18n.t('download.completed_warning', { name: item.metadata.musicInfo.name, error: item.statusText })
            : i18n.t('download.completed', { name: item.metadata.musicInfo.name }),
          item.statusText ? 6 : 3
        )
      }
    }
  }
  downloadState.list = applyDownloadAction(downloadState.list, action)
  downloadState.revision = action.revision
}

export const refreshDownloadList = async () => {
  const currentGeneration = ++generation
  let retry = false
  buffered = []
  downloadState.loading = true
  downloadState.error = ''
  try {
    const snapshot = await getDownloadSnapshot()
    if (currentGeneration !== generation) return
    downloadState.list = snapshot.list
    downloadState.revision = snapshot.revision
    for (const action of buffered.sort((a, b) => a.revision - b.revision)) {
      if (action.revision > downloadState.revision + 1) {
        retry = true
        break
      }
      update(action)
    }
  } catch (err) {
    if (currentGeneration !== generation) return
    downloadState.error = err instanceof Error ? err.message : String(err)
  } finally {
    if (currentGeneration === generation) {
      downloadState.loading = false
      buffered = []
    }
  }
  if (retry && currentGeneration === generation && downloadState.connected) void refreshDownloadList()
}

export const initDownload = () => {
  downloadListActionEvent.on((action) => {
    if (!downloadState.connected) return
    if (downloadState.loading) {
      buffered.push(action)
      return
    }
    if (action.revision > downloadState.revision + 1) {
      void refreshDownloadList()
      return
    }
    update(action)
  })
  onConnected(() => {
    downloadState.connected = true
    downloadState.revision = 0
    void refreshDownloadList()
  })
  onDesconnected(() => {
    generation++
    downloadState.connected = false
    downloadState.loading = false
    buffered = []
  })
  onRelease(() => {
    generation++
    downloadState.connected = false
    downloadState.loading = false
    downloadState.list = []
    downloadState.revision = 0
    downloadState.error = ''
    buffered = []
  })
}
