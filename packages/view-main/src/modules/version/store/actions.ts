import { saveIgnoreVersion as saveIgnoreVersionRemote } from '@/shared/ipc/data'
import { getItem, LOCAL_STORE_KEYS, setItem } from '@/shared/localStore'

import * as commit from './commit'

export { initCurrentVersionInfo, setProgress, setUpdateInfo } from './commit'
export { checkUpdate, downloadUpdate, getCurrentVersionInfo, registerRemoteActions, restartUpdate } from './remoteActions'

export const ignoreFailTip = () => {
  setItem(LOCAL_STORE_KEYS.updateCheckFailedTip, Date.now().toString())
}
export const isIgnoreFailTip = () => {
  return Date.now() - parseInt(getItem(LOCAL_STORE_KEYS.updateCheckFailedTip) ?? '0') < 7 * 86400000
}

export const saveIgnoreVersion = async (version: string | null) => {
  await saveIgnoreVersionRemote(version)
  commit.setIgnoreVersion(version)
}
