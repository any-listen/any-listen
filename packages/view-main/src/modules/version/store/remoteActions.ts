import { updateInfoEvent } from '@/shared/ipc/app/event'

import * as commit from './commit'

export { checkUpdate, downloadUpdate, getCurrentVersionInfo, restartUpdate } from '@/shared/ipc/app'

export const registerRemoteActions = () => {
  return updateInfoEvent.on((info): void => {
    commit.setUpdateInfo(info)
  })
}
