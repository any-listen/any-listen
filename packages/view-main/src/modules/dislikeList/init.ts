import { onRelease } from '@/modules/app/shared'
import { onPlayerCreated } from '@/modules/player/shared'
import { createUnsubscriptionSet } from '@/shared'

import { registerRemoteActions, getInfo, initInfo } from './store/actions'

const unregistered = createUnsubscriptionSet()

export const initDislikeList = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerRemoteActions())
    })

    void init()
  })
}

const init = async () => {
  initInfo(await getInfo())
}
