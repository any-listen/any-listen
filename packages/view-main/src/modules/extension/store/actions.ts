import * as commit from './commit'
import { getOnlineExtensionList as getOnlineExtensionListRemote, resetOnlineData as resetOnlineDataRemote } from './remoteAction'
import { extensionState } from './state'

export const getOnlineExtensionList = async (force = false) => {
  if (!force && extensionState.onlineExtensionList.length) return
  // TODO
  await resetOnlineDataRemote()
  const { list } = await getOnlineExtensionListRemote({ page: 1, limit: 1000 })
  commit.setOnlineExtension(list)
}

export {
  disableExtension,
  downloadAndParseExtension,
  enableExtension,
  getAllExtensionSettings,
  getExtensionErrorMessage,
  getExtensionList,
  executeCommand,
  getResourceList,
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
