import { onMount } from 'svelte'
import { readable } from 'svelte/store'

import { extI18n, extI18nMessageChangedEvent } from './i18n'
import { extensionEvent } from './store/event'
import { extensionState } from './store/state'

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
  let list = $state.raw<AnyListen.IPCExtension.OnlineListItem[]>(extensionState.onlineExtensionList)

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

export const useExtensionNewVersionNum = () => {
  let num = $state(Object.keys(extensionState.newVersionInfo).length)

  $effect(() => {
    num = Object.keys(extensionState.newVersionInfo).length
    return extensionEvent.on('newVersionInfoUpdated', () => {
      num = Object.keys(extensionState.newVersionInfo).length
    })
  })

  return {
    get val() {
      return num
    },
  }
}

export const useExtensionError = () => {
  let error = $state(extensionState.extensionList.some((ext) => !!ext.errorMessage))

  $effect(() => {
    error = extensionState.extensionList.some((ext) => !!ext.errorMessage)
    return extensionEvent.on('listChanged', () => {
      error = extensionState.extensionList.some((ext) => !!ext.errorMessage)
    })
  })

  return {
    get val() {
      return error
    },
  }
}

export const useExtensionLatestVersion = (ext: string) => {
  let latest = $state(!extensionState.newVersionInfo[ext])

  $effect(() => {
    latest = !extensionState.newVersionInfo[ext]
    return extensionEvent.on('newVersionInfoUpdated', () => {
      latest = !extensionState.newVersionInfo[ext]
    })
  })

  return {
    get val() {
      return latest
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
