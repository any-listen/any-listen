import { onWinMainIPCConnected } from '@/modules/app/shared'
import { getEnvLocale, i18n } from '@/plugins/i18n'
import { createUnsubscriptionSet } from '@/shared'

import { getSetting, registerRemoteSettingAction } from './store/action'
import { initSetting as overwriteSetting } from './store/commit'
import { settingEvent } from './store/event'

const init = async () => {
  const setting = await getSetting()
  const newSetting = new Map<keyof AnyListen.AppSetting, unknown>()

  if (!setting['common.langId'] || !i18n.availableLocales.includes(setting['common.langId'])) {
    const langId = getEnvLocale()
    setting['common.langId'] = langId
    newSetting.set('common.langId', langId)
    console.log('Set lang', setting['common.langId'])
  }
  overwriteSetting(setting)
}

const unregistered = createUnsubscriptionSet()
export const initSetting = () => {
  onWinMainIPCConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerRemoteSettingAction())
      subscriptions.add(
        settingEvent.on('updated', (keys, setting) => {
          if (keys.includes('common.isShowAnimation')) {
            document.body.classList.toggle('no-animation', !setting['common.isShowAnimation'])
          }
          if (keys.includes('common.font')) {
            if (setting['common.font']) document.documentElement.style.fontFamily = setting['common.font']
            else document.documentElement.style.removeProperty('font-family')
          }
          if (keys.includes('common.fontSize')) {
            document.documentElement.style.fontSize = `${setting['common.fontSize']}px`
          }
        })
      )
    })

    void init()
  })
}
