import { onConnected, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'

import { setUserListInited } from './store/actions'
import { registerListAction } from './store/listRemoteActions'

const unregistered = createUnsubscriptionSet()

export const initMusicLibrary = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerListAction())
    })

    void init()
  })
}

const init = async () => {
  setUserListInited(false)
}
