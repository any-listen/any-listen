import { onUpdateInfo } from '@/shared/ipc/app'
import * as commit from './commit'

export { getCurrentVersionInfo, checkUpdate, downloadUpdate, restartUpdate } from '@/shared/ipc/app'

export const registerRemoteActions = () => {
  return onUpdateInfo((info): void => {
    commit.setUpdateInfo(info)
  })
}
