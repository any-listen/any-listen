import { useSettingValue } from '@/modules/setting/reactive.svelte'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { useI18n } from '@/plugins/i18n.svelte'

export const useNextTogglePlay = () => {
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  const i18n = useI18n()
  const nextTogglePlayName = $derived.by(() => {
    switch (togglePlayMethod.val) {
      case 'listLoop':
        return i18n.t('player__play_toggle_mode_list_loop')
      case 'random':
        return i18n.t('player__play_toggle_mode_random')
      case 'singleLoop':
        return i18n.t('player__play_toggle_mode_single_loop')
      case 'list':
        return i18n.t('player__play_toggle_mode_list')
      default:
        return i18n.t('player__play_toggle_mode_none')
    }
  })

  const toggleMode = (mode: AnyListen.AppSetting['player.togglePlayMethod']) => {
    if (mode == settingState.setting['player.togglePlayMethod']) return
    void updateSetting({ 'player.togglePlayMethod': mode })
  }

  return {
    get name() {
      return nextTogglePlayName
    },
    toggleMode,
  }
}
