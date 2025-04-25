<script lang="ts">
  import SliderBar from '@/components/base/SliderBar.svelte'
  import { t } from '@/plugins/i18n'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { setMediaDeviceId } from '@/plugins/player'
  import { settingState } from '@/modules/setting/store/state'
  import { updateSetting } from '@/modules/setting/store/action'
  import Btn from '@/components/base/Btn.svelte'
  const playbackRate = useSettingValue('player.soundEffect.pitchShifter.playbackRate')

  const handleSetPreset = async (value: number) => {
    const setting: Partial<AnyListen.AppSetting> = {}
    if (settingState.setting['player.mediaDeviceId'] != 'default') {
      await setMediaDeviceId('default').catch(() => {})
      setting['player.mediaDeviceId'] = 'default'
    }
    void updateSetting({ 'player.soundEffect.pitchShifter.playbackRate': value })
  }
  const handleUpdatePlaybackRate = (value: number) => {
    value = parseFloat((Math.round(value) / 100).toFixed(2))
    void handleSetPreset(value)
  }
</script>

<div class="container">
  <div class="header player__sound_effect_title">
    <h3>
      {$t('player__sound_effect_pitch_shifter')}
      <span aria-label={$t('player__sound_effect_pitch_shifter_tip')}>
        <SvgIcon name="information-slab-circle-outline" />
      </span>
    </h3>
    <Btn min onclick={async () => handleSetPreset(1)}>{$t('player__sound_effect_reset_btn')}</Btn>
  </div>
  <div class="contnet">
    <span class="label">{playbackRate.val.toFixed(2)}x</span>
    <SliderBar value={playbackRate.val * 100} min={50} max={150} onchange={handleUpdatePlaybackRate} />
  </div>
</div>

<style lang="less">
  .container {
    padding-top: 15px;
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
    min-height: 0;
    flex: none;
    &:before {
      .mixin-after();
      position: absolute;
      top: 0;
      height: 1px;
      width: 100%;
      border-top: 1px dashed var(--color-primary-light-100-alpha-700);
    }

    :global {
      .slider {
        flex: auto;
      }
    }
  }
  .header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 5px;
  }
  .contnet {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
  }
  .label {
    flex: none;
    // width: 50px;
    font-size: 12px;
  }
</style>
