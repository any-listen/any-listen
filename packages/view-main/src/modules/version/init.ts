import { showUpdateModal } from '@/components/apis/updateModal'
import { onConnected, onRelease } from '@/modules/app/shared'
import { createUnsubscriptionSet } from '@/shared'
import { getCurrentVersionInfo, initCurrentVersionInfo, registerRemoteActions } from './store/actions'
import { versionEvent } from './store/event'

const init = async () => {
  const info = await getCurrentVersionInfo()
  console.log(info)
  initCurrentVersionInfo(info)
}

const unregistered = createUnsubscriptionSet()
export const initVersion = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerRemoteActions())
      subscriptions.add(
        versionEvent.on('new_version_available', (newVersion, ignoreVersion) => {
          if (newVersion?.version == ignoreVersion) return
          void showUpdateModal()
        })
      )

      void init()
    })
  })
}
