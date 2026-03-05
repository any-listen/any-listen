import { onConnected, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { setUserListInited } from './store/actions'
import { clearListCover } from './store/commit'
import { musicLibraryEvent } from './store/event'
import { registerListAction } from './store/listRemoteActions'

const unregistered = createUnsubscriptionSet()

export const initMusicLibrary = () => {
  onRelease(() => {
    unregistered.clear()
    clearListCover()
  })
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerListAction())
      subscriptions.add(
        musicLibraryEvent.on('listMusicChanged', (ids) => {
          for (const id of ids) {
            clearListCover(id)
          }
        })
      )
    })

    void init()
  })
}

const init = async () => {
  setUserListInited(false)
}
