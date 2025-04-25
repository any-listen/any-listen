import { onConnected, onRelease } from '@/modules/app/shared'
import { getEnvLocale, i18n } from '@/plugins/i18n'
import { createUnsubscriptionSet } from '@/shared'
import { handleConfigChange } from '@/shared/browser/widnow'
import { appState } from '../app/store/state'
import { getSetting, registerRemoteSettingAction, updateSetting } from './store/action'
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

  if (import.meta.env.VITE_IS_DESKTOP) {
    if (
      !setting['common.startInFullscreen'] &&
      (document.body.clientHeight > window.screen.availHeight || document.body.clientWidth > window.screen.availWidth) &&
      setting['common.windowSizeId'] > 1
    ) {
      setting['common.windowSizeId'] = 1
      newSetting.set('common.windowSizeId', 1)
    }
  }
  if (newSetting.size) void updateSetting(Object.fromEntries(newSetting.entries()))
  overwriteSetting(setting)
}

const unregistered = createUnsubscriptionSet()
export const initSetting = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onConnected(() => {
    unregistered.register((subscriptions) => {
      subscriptions.add(registerRemoteSettingAction())
      subscriptions.add(
        settingEvent.on('updated', (keys, setting) => {
          if (keys.includes('common.isShowAnimation')) {
            document.body.classList.toggle('no-animation', !setting['common.isShowAnimation'])
          }
          if (keys.includes('common.fontSize')) {
            if (appState.isFullscreen) return
            document.documentElement.style.fontSize = `${setting['common.fontSize']}px`
          }
          if (import.meta.env.VITE_IS_WEB) handleConfigChange(keys, setting)
        })
      )
    })

    void init()
  })
}
