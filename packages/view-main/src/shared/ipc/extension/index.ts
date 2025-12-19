import { ipc } from '../ipc'

export const getExtensionErrorMessage = async () => {
  return ipc.getExtensionErrorMessage()
}

export const getExtensionList = async () => {
  return ipc.getExtensionList()
}

export const getOnlineExtensionList: AnyListen.IPC.ServerIPC['getOnlineExtensionList'] = async (opts) => {
  return ipc.getOnlineExtensionList(opts)
}
export const getOnlineExtensionDetail: AnyListen.IPC.ServerIPC['getOnlineExtensionDetail'] = async (id) => {
  return ipc.getOnlineExtensionDetail(id)
}
export const getOnlineCategories: AnyListen.IPC.ServerIPC['getOnlineCategories'] = async () => {
  return ipc.getOnlineCategories()
}
export const getOnlineTags: AnyListen.IPC.ServerIPC['getOnlineTags'] = async () => {
  return ipc.getOnlineTags()
}
export const resetOnlineData: AnyListen.IPC.ServerIPC['resetOnlineData'] = async () => {
  return ipc.resetOnlineData()
}

export const downloadAndParseExtension: AnyListen.IPC.ServerIPC['downloadAndParseExtension'] = async (url, manifest) => {
  return ipc.downloadAndParseExtension(url, manifest)
}

export const installExtension: AnyListen.IPC.ServerIPC['installExtension'] = async (tempExtension) => {
  return ipc.installExtension(tempExtension)
}

export const updateExtension: AnyListen.IPC.ServerIPC['updateExtension'] = async (tempExtension) => {
  return ipc.updateExtension(tempExtension)
}

export const startExtension: AnyListen.IPC.ServerIPC['startExtension'] = async (id) => {
  return ipc.startExtension(id)
}

export const enableExtension: AnyListen.IPC.ServerIPC['enableExtension'] = async (id) => {
  return ipc.enableExtension(id)
}

export const disableExtension: AnyListen.IPC.ServerIPC['disableExtension'] = async (id) => {
  return ipc.disableExtension(id)
}

export const restartExtension: AnyListen.IPC.ServerIPC['restartExtension'] = async (id) => {
  return ipc.restartExtension(id)
}

export const uninstallExtension: AnyListen.IPC.ServerIPC['uninstallExtension'] = async (id) => {
  return ipc.uninstallExtension(id)
}

export const restartExtensionHost: AnyListen.IPC.ServerIPC['restartExtensionHost'] = async () => {
  return ipc.restartExtensionHost()
}

export const getResourceList: AnyListen.IPC.ServerIPC['getResourceList'] = async () => {
  return ipc.getResourceList()
}

export const getAllExtensionSettings: AnyListen.IPC.ServerIPC['getAllExtensionSettings'] = async () => {
  return ipc.getAllExtensionSettings()
}

export const updateExtensionSettings: AnyListen.IPC.ServerIPC['updateExtensionSettings'] = async (extId, config) => {
  return ipc.updateExtensionSettings(extId, config)
}

type RA = AnyListen.IPCExtension.ResourceAction
export const resourceAction = async <T extends keyof RA>(
  action: T,
  params: Parameters<RA[T]>[0]
): Promise<Awaited<ReturnType<RA[T]>>> => {
  return ipc.resourceAction(action, params)
}

type LPA = AnyListen.IPCExtension.ListProviderAction
export const listProviderAction = async <T extends keyof LPA>(
  action: T,
  params: Parameters<LPA[T]>[0]
): Promise<Awaited<ReturnType<LPA[T]>>> => {
  return ipc.listProviderAction(action, params)
}

export const getExtensionLastLogs: AnyListen.IPC.ServerIPC['getExtensionLastLogs'] = async (extId) => {
  return ipc.getExtensionLastLogs(extId)
}
export const clearExtensionLogs: AnyListen.IPC.ServerIPC['clearExtensionLogs'] = async (extId) => {
  return ipc.clearExtensionLogs(extId)
}
