import { compareVersions } from '@/shared'

import { extensionEvent } from './event'
import { type InitState, extensionState } from './state'

export const setList = (list: AnyListen.Extension.Extension[]) => {
  extensionState.extensionList = list
  extensionEvent.listChanged(true)
}

export const addExtension = (ext: AnyListen.Extension.Extension) => {
  extensionState.extensionList.unshift(ext)
  extensionEvent.listChanged(true)
}

export const removeExtension = (id: string) => {
  extensionState.extensionList.splice(
    extensionState.extensionList.findIndex((ext) => ext.id == id),
    1
  )
  extensionEvent.listChanged(true)
}

export const updateExtension = (ext: AnyListen.Extension.Extension) => {
  extensionState.extensionList.splice(
    extensionState.extensionList.findIndex((e) => e.id == ext.id),
    1,
    ext
  )
  extensionEvent.listChanged(true)
}

export const setExtensionRuning = (id: string, loadTimestamp: number) => {
  const tagretExtIndex = extensionState.extensionList.findIndex((ext) => ext.id == id)
  if (tagretExtIndex < 0) return
  const tagretExt = extensionState.extensionList[tagretExtIndex]
  tagretExt.loaded = true
  tagretExt.loadTimestamp = loadTimestamp
  tagretExt.errorMessage &&= ''
  extensionState.extensionList.splice(tagretExtIndex, 1, { ...tagretExt })
  extensionEvent.listChanged()
}

export const setExtensionEnabled = (id: string, enabled: boolean) => {
  const tagretExtIndex = extensionState.extensionList.findIndex((ext) => ext.id == id)
  if (tagretExtIndex < 0) return
  const tagretExt = extensionState.extensionList[tagretExtIndex]
  tagretExt.enabled = enabled
  extensionState.extensionList.splice(tagretExtIndex, 1, { ...tagretExt })
  extensionEvent.listChanged()
}

export const setExtensionStopped = (id: string) => {
  const tagretExtIndex = extensionState.extensionList.findIndex((ext) => ext.id == id)
  if (tagretExtIndex < 0) return
  const tagretExt = extensionState.extensionList[tagretExtIndex]
  tagretExt.loaded = false
  tagretExt.loadTimestamp = 0
  tagretExt.errorMessage &&= ''
  extensionState.extensionList.splice(tagretExtIndex, 1, { ...tagretExt })
  extensionEvent.listChanged()
}

export const setExtensionError = (id: string, message: string) => {
  const tagretExtIndex = extensionState.extensionList.findIndex((ext) => ext.id == id)
  if (tagretExtIndex < 0) return
  const tagretExt = extensionState.extensionList[tagretExtIndex]
  tagretExt.loaded = false
  tagretExt.errorMessage = message
  tagretExt.loadTimestamp = 0
  extensionState.extensionList.splice(tagretExtIndex, 1, { ...tagretExt })
  extensionEvent.listChanged()
}

export const setCrash = (message: string | null) => {
  extensionState.crashMessage = message
  if (message != null) extensionEvent.crash(message)
}

export const setStatus = (status: InitState['status']) => {
  setCrash(null)
  extensionState.status = status
  extensionEvent.statusChanged(status)
}

export const setResourceList = (list: AnyListen.Extension.ResourceList) => {
  extensionState.resourceList = list
  extensionEvent.resourceListUpdated(list)
}

export const setOnlineExtension = (list: AnyListen.IPCExtension.OnlineListItem[]) => {
  const extMap = new Map<string, AnyListen.Extension.Extension>()
  for (const ext of extensionState.extensionList) extMap.set(ext.id, ext)

  extensionState.onlineExtensionList = list.map((item) => {
    const target = extMap.get(item.id)
    if (!target) return { ...item, installed: false, enabled: false, latest: false, currentVersion: '' }
    return {
      ...item,
      enabled: target.enabled,
      installed: true,
      latest: compareVersions(target.version, item.version) >= 0,
      currentVersion: target.version,
    }
  })
  extensionEvent.onlineExtensionListUpdated(extensionState.onlineExtensionList)
}
