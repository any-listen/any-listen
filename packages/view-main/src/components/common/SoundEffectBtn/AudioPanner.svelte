<script lang="ts">
  import SliderBar from '@/components/base/SliderBar.svelte'
  import { t } from '@/plugins/i18n'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import Checkbox from '@/components/base/Checkbox.svelte'

  const enable = useSettingValue('player.soundEffect.panner.enable')
  const speed = useSettingValue('player.soundEffect.panner.speed')
  const soundR = useSettingValue('player.soundEffect.panner.soundR')

  const updateEnabled = async (enabled: boolean) => {
    void updateSetting({
      'player.soundEffect.panner.enable': enabled,
    })
  }

  const handleUpdateSoundR = (value: number) => {
    void updateSetting({ 'player.soundEffect.panner.soundR': Math.round(value) })
  }
  const handleUpdateSpeed = (value: number) => {
    void updateSetting({ 'player.soundEffect.panner.speed': Math.round(value) })
  }
</script>

<div class="container">
  <div class="header player-sound-effect-title">
    <h3>
      {$t('player__sound_effect_panner')}
    </h3>
    <Checkbox
      id="player__sound_effect_panner_enabled"
      label={$t('player__sound_effect_enabled')}
      checked={enable.val}
      onchange={updateEnabled}
    />
  </div>
  <div class="contnet">
    <div class="row">
      <span class="label">{$t('player__sound_effect_panner_sound_speed')}</span>
      <SliderBar value={speed.val} min={20} max={100} step={1} onchange={handleUpdateSpeed} />
      <span class="value">{speed.val}</span>
    </div>
    <div class="row">
      <span class="label">{$t('player__sound_effect_panner_sound_r')}</span>
      <SliderBar value={soundR.val} min={1} max={30} step={1} onchange={handleUpdateSoundR} />
      <span class="value">{soundR.val}</span>
    </div>
  </div>
</div>

<style lang="less">
  .container {
    position: relative;
    display: flex;
    flex: none;
    flex-flow: column nowrap;
    gap: 8px;
    min-height: 0;
    padding-top: 15px;
    &::before {
      .mixin-after();

      position: absolute;
      top: 0;
      width: 100%;
      height: 1px;
      border-top: 1px dashed var(--color-primary-light-100-alpha-700);
    }

    :global {
      .slider {
        flex: auto;
      }
      .checkbox {
        margin-right: 5px;
        font-size: 13px;
      }
    }
  }
  .header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 5px;
  }
  .contnet {
    display: flex;
    flex-flow: column nowrap;
    gap: 15px;
    width: 100%;
  }
  .row {
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
  }
  .label {
    flex: none;
    // width: 50px;
    font-size: 12px;
  }
  .value {
    flex: none;
    width: 40px;
    font-size: 12px;
    text-align: center;

    // &.active {
    //   color: var(--color-primary-font);
    // }
  }
</style>
