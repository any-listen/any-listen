import { versionEvent } from './store/event'
import { versionState } from './store/state'

export const useVersionInfo = () => {
  let val = $state.raw(versionState.versionInfo)

  $effect(() => {
    const unsub = versionEvent.on('updated', (info) => {
      val = info
    })
    return unsub
  })

  return {
    get val() {
      return val
    },
  }
}

export const useIgnoreVersion = () => {
  let val = $state.raw(versionState.ignoreVersion)

  $effect(() => {
    const unsub = versionEvent.on('ignore_version_updated', (info) => {
      val = info
    })
    return unsub
  })

  return {
    get val() {
      return val
    },
  }
}

export const useDownloadProgress = () => {
  let val = $state.raw(versionState.progress)

  $effect(() => {
    const unsub = versionEvent.on('download_progress_updated', (info) => {
      val = info
    })
    return unsub
  })

  return {
    get val() {
      return val
    },
  }
}
