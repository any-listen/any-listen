import { extensionEvent } from './event'
import { initListProvider } from './listProvider'
import { extensionState } from './state'

export const initExtensionModule = async () => {
  await initListProvider()
}

export { extensionEvent, extensionState }

export { sortUserList as sortRemoteUserList, syncList as syncRemoteUserList } from './listProvider'
