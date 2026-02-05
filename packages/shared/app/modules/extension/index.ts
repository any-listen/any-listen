import { workers } from '../worker'
import { extensionEvent } from './event'
import { initListProvider } from './listProvider'
import { extensionState } from './state'

const initState = async () => {
  extensionState.resources = await workers.extensionService.getResourceList()
  extensionEvent.on('extensionEvent', (event) => {
    if (event.action != 'resourceUpdated') return
    extensionState.resources = event.data
  })
}
export const initExtensionModule = async () => {
  await initListProvider()
  await initState()
}

export { extensionEvent, extensionState }

export {
  parseMusicInfoMetadata as parseRemoteMusicInfoMetadata,
  sortUserList as sortRemoteUserList,
  syncList as syncRemoteUserList,
} from './listProvider'
