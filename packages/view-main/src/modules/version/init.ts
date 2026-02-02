import { showSimpleModal } from '@/components/apis/dialog'
import { showNotify } from '@/components/apis/notify'
import { showUpdateModal } from '@/components/apis/updateModal'
import { onConnected, onRelease } from '@/modules/app/shared'
import { i18n } from '@/plugins/i18n'
import { createUnsubscriptionSet } from '@/shared'
import { getItem, LOCAL_STORE_KEYS, setItem } from '@/shared/localStore'
import { settingState } from '../setting/store/state'
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
          const latestVersion =
            newVersion?.beta && settingState.setting['common.allowPreRelease'] ? newVersion.beta[0].version : newVersion?.version
          if (latestVersion == ignoreVersion) return
          void showUpdateModal()
        })
      )
      subscriptions.add(
        versionEvent.on('downloaded', () => {
          void showUpdateModal()
        })
      )
      subscriptions.add(
        versionEvent.on('error', (preStatus, message) => {
          if (preStatus == 'downloading') {
            const preTime = parseInt(getItem(LOCAL_STORE_KEYS.updateDownloadFailedTip) ?? '0')
            showNotify(i18n.t('update_download_failed_tip', { msg: message }))
            void showUpdateModal()
            if (Date.now() - preTime < 7 * 86400_000) return
            setTimeout(() => {
              void showSimpleModal(i18n.t('update_failed_tip')).finally(() => {
                setItem(LOCAL_STORE_KEYS.updateDownloadFailedTip, String(Date.now()))
              })
            }, 400)
          } else if (preStatus == 'checking') {
            showNotify(i18n.t('update.checking_failed', { msg: message }))
          } else if (preStatus == 'idle') {
            showNotify(i18n.t('update.update_failed', { msg: message }))
          }
        })
      )
      void init()
    })
  })
}
