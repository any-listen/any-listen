import * as commit from './commit'
import { getOnlineExtensionList as getOnlineExtensionListRemote, resetOnlineData as resetOnlineDataRemote } from './remoteAction'
import { extensionState } from './state'

export const getOnlineExtensionList = async (force = false) => {
  if (!force && extensionState.onlineExtensionList.length) return
  // TODO
  const t = performance.now()
  let { list } = await getOnlineExtensionListRemote({ page: 1, limit: 1000 })
  commit.setOnlineExtension(list)
  const cost = performance.now() - t
  console.log(`get online extension list cost: ${cost}ms`)
  if (cost < 1000) {
    await resetOnlineDataRemote()
    ;({ list } = await getOnlineExtensionListRemote({ page: 1, limit: 1000 }))
    commit.setOnlineExtension(list)
  }
}

export const setNewVersionInfo = (info: AnyListen.IPCExtension.EventVersionInfoUpdated) => {
  commit.setNewVersionInfo(info)
}

export {
  disableExtension,
  downloadAndParseExtension,
  enableExtension,
  getAllExtensionSettings,
  getExtensionConfigValues,
  getExtensionErrorMessage,
  getExtensionList,
  executeCommand,
  getResourceList,
  getNewVersionInfo,
  installExtension,
  listProviderAction,
  registerRemoteExtensionEvent,
  resourceAction,
  restartExtension,
  restartExtensionHost,
  startExtension,
  uninstallExtension,
  updateExtension,
  updateExtensionSettings,
} from './remoteAction'

export { setCrash, setList, setResourceList } from './commit'
