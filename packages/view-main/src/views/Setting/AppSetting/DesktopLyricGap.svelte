<script lang="ts">
  import { updateSetting } from '@/modules/setting/store/action'
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import { settingState } from '@/modules/setting/store/state'
  import Btn from '@/components/base/Btn.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'

  const lineGap = useSettingValue('desktopLyric.style.lineGap')

  const changeLineGap = (step: number) => {
    let gap = settingState.setting['desktopLyric.style.lineGap'] + step
    void updateSetting({ 'desktopLyric.style.lineGap': Math.min(Math.max(gap, 0), 25) })
  }
</script>

<TitleContent name={$t('settings.desktopLyric.line_gap', { num: lineGap.val })}>
  <div class="settings-item-content">
    <Btn
      min
      onclick={() => {
        changeLineGap(-1)
      }}>{$t('settings.desktopLyric.line_gap_decrease')}</Btn
    >
    <Btn
      min
      onclick={() => {
        changeLineGap(1)
      }}>{$t('settings.desktopLyric.line_gap_increase')}</Btn
    >
  </div>
</TitleContent>

<style lang="less">
  .settings-item-content {
    display: flex;
    flex-flow: row wrap;
    gap: 15px;
    align-items: center;
    padding-top: 5px;
  }
</style>
