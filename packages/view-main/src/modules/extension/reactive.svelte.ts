import { onMount } from 'svelte'
import { readable } from 'svelte/store'

import { extI18n, extI18nMessageChangedEvent } from './i18n'
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

export const useExtensionCommands = () => {
  let list = $state.raw<AnyListen.Extension.Command[]>([])

  onMount(() => {
    const buildCommands = (resourceList: AnyListen.Extension.ResourceList): AnyListen.Extension.Command[] => {
      return resourceList.commands
        .filter((c) => !c.hidden)
        .map((cmd) => {
          return {
            ...cmd,
            name: extI18n.t(cmd.extensionId, cmd.name),
            description: cmd.description ? extI18n.t(cmd.extensionId, cmd.description) : undefined,
            extensionName: extI18n.t(cmd.extensionId, cmd.extensionName),
          }
        })
    }
    const unsub = resourceList.subscribe((res) => {
      list = buildCommands(res)
    })
    const unsub2 = extI18nMessageChangedEvent.on(() => {
      list = buildCommands(extensionState.resourceList)
    })

    return () => {
      unsub()
      unsub2()
    }
  })

  return {
    get val() {
      return list
    },
  }
}
