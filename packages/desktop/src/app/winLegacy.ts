import os from 'node:os'

import { STORE_NAMES } from '@any-listen/common/constants'
import { dialog } from 'electron'

import { i18n } from '@/i18n'
import { openUrl } from '@/shared/electron'
import { getStore } from '@/shared/store'

const showWinLegacyMessage = () => {
  if (process.platform !== 'win32') return
  const storeKey = 'winLegacyMessageShown'
  const dataStore = getStore(STORE_NAMES.DATA)
  const count = dataStore.get<number>(storeKey) || 0
  if (count > 2) return
  const osVersion = os.release()
  const majorVersion = parseInt(osVersion.split('.')[0], 10)
  const isOldWindows = majorVersion < 10

  if (isOldWindows) {
    const result = dialog.showMessageBoxSync({
      type: 'warning',
      title: i18n.t('winLegacyMessage.old_os_title'),
      message: i18n.t('winLegacyMessage.old_os_message'),
      buttons: [i18n.t('winLegacyMessage.button_ok')],
    })
    if (result === 0) {
      dataStore.set(storeKey, count + 1)
    }
  } else {
    const result = dialog.showMessageBoxSync({
      type: 'warning',
      title: i18n.t('winLegacyMessage.title'),
      message: i18n.t('winLegacyMessage.message'),
      buttons: [i18n.t('winLegacyMessage.button_goto'), i18n.t('winLegacyMessage.button_ok')],
    })
    if (result === 0) {
      void openUrl('https://github.com/any-listen/any-listen-desktop/releases')
    } else if (result === 1) {
      dataStore.set('winLegacyMessageShown', count + 1)
    }
  }
}

showWinLegacyMessage()
