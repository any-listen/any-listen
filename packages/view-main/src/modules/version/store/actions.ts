import { saveIgnoreVersion as saveIgnoreVersionRemote } from '@/shared/ipc/data'
import * as commit from './commit'

export { initCurrentVersionInfo, setProgress, setUpdateInfo } from './commit'
export { checkUpdate, downloadUpdate, getCurrentVersionInfo, registerRemoteActions, restartUpdate } from './remoteActions'

export const ignoreFailTip = () => {
  localStorage.setItem('update__check_failed_tip', Date.now().toString())
}
export const isIgnoreFileTip = () => {
  return Date.now() - parseInt(localStorage.getItem('update__check_failed_tip') ?? '0') < 7 * 86400000
}

export const saveIgnoreVersion = async (version: string | null) => {
  await saveIgnoreVersionRemote(version)
  commit.setIgnoreVersion(version)
}
