import { workers } from '../worker'
import { extensionEvent } from './event'
import { initListProvider as initOnlineListProvider } from './onlineListProvider'
import { initListProvider as initRemoteListProvider } from './remoteListProvider'
import { extensionState } from './state'

const initState = async () => {
  extensionState.resources = await workers.extensionService.getResourceList()
  extensionEvent.on('extensionEvent', (event) => {
    if (event.action != 'resourceUpdated') return
    extensionState.resources = event.data
  })
}
export const initExtensionModule = async () => {
  await initRemoteListProvider()
  await initOnlineListProvider()
  await initState()
}

export { extensionEvent, extensionState }

export {
  parseMusicInfoMetadata as parseRemoteMusicInfoMetadata,
  sortUserList as sortRemoteUserList,
  syncList as syncRemoteUserList,
  syncAllList as syncAllRemoteUserList,
} from './remoteListProvider'
export { syncList as syncOnlineUserList, syncAllList as syncAllOnlineUserList } from './onlineListProvider'
