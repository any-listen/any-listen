import { readable } from 'svelte/store'

import { extensionEvent } from './store/event'
import { extensionState, type OnlineListItem } from './store/state'

export const extensionStatus = readable(extensionState.status, (set) => {
  set(extensionState.status)
  const unsubscribe = extensionEvent.on('statusChanged', () => {
    set(extensionState.status)
  })

  return function stop() {
    unsubscribe()
  }
})

export const extensionList = readable(extensionState.extensionList, (set) => {
  set(extensionState.extensionList.filter((ext) => !ext.internal))
  const unsubscribe = extensionEvent.on('listChanged', () => {
    set([...extensionState.extensionList.filter((ext) => !ext.internal)])
  })

  return function stop() {
    unsubscribe()
  }
})

export const resourceList = readable(extensionState.resourceList, (set) => {
  set(extensionState.resourceList)
  const unsubscribe = extensionEvent.on('resourceListUpdated', () => {
    set({ ...extensionState.resourceList })
  })

  return function stop() {
    unsubscribe()
  }
})

export const useOnlineExtensionList = () => {
  let list = $state.raw<OnlineListItem[]>(extensionState.onlineExtensionList)

  $effect(() => {
    list = extensionState.onlineExtensionList
    return extensionEvent.on('onlineExtensionListUpdated', (l) => {
      list = l
    })
  })

  return {
    get val() {
      return list
    },
  }
}
