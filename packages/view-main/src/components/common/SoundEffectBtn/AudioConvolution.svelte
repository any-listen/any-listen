<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import Checkbox from '@/components/base/Checkbox.svelte'
  import SliderBar from '@/components/base/SliderBar.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import { settingState } from '@/modules/setting/store/state'
  import { removeUserConvolutionPreset, saveUserConvolutionPreset } from '@/modules/soundEffect/store/actions'
  import { t } from '@/plugins/i18n'
  import { convolutions } from '@/plugins/player'
  import { useUserConvolutionPresetList } from '@/modules/soundEffect/reactive.svelte'
  import AddPresetBtn from './AddPresetBtn.svelte'
  let convolutionFileName = useSettingValue('player.soundEffect.convolution.fileName')
  let mainGain = useSettingValue('player.soundEffect.convolution.mainGain')
  let sendGain = useSettingValue('player.soundEffect.convolution.sendGain')
  const userPresetList = useUserConvolutionPresetList()

  const updateConvolution = async (val: string) => {
    const setting: Partial<AnyListen.AppSetting> = {
      'player.soundEffect.convolution.fileName': val,
    }
    const target = convolutions.find((c) => c.source == val)
    if (target) {
      setting['player.soundEffect.convolution.mainGain'] = target.mainGain * 10
      setting['player.soundEffect.convolution.sendGain'] = target.sendGain * 10
    }
    void updateSetting(setting)
  }

  const handleUpdateMainGain = (value: number) => {
    void updateSetting({ 'player.soundEffect.convolution.mainGain': Math.round(value) })
  }
  const handleUpdateSendGain = (value: number) => {
    void updateSetting({ 'player.soundEffect.convolution.sendGain': Math.round(value) })
  }

  const handleSetPreset = (item: AnyListen.SoundEffect.ConvolutionPreset) => {
    void updateSetting({
      'player.soundEffect.convolution.fileName': item.source,
      'player.soundEffect.convolution.mainGain': item.mainGain,
      'player.soundEffect.convolution.sendGain': item.sendGain,
    })
  }
  const handleRemovePreset = (id: string) => {
    void removeUserConvolutionPreset(id)
  }

  const disabledConvolution = $derived(!convolutionFileName.val)
</script>

<div class="contnet">
  <h3 class="player-sound-effect-title">{$t('player__sound_effect_convolution')}</h3>
  <div class="convolution">
    <div class="convolution-list">
      {#each convolutions as item (item.name)}
        <Checkbox
          id={`player__convolution_${item.name}`}
          checked={convolutionFileName.val == item.source}
          label={$t(`player__sound_effect_convolution_file_${item.name}`)}
          onchange={(checked) => {
            void updateConvolution(checked ? item.source : '')
          }}
        />
      {/each}
    </div>
    <div class="slider-list" class:disabled={disabledConvolution}>
      <div class="slider-item">
        <span class="label">{$t('player__sound_effect_convolution_main_gain')}</span>
        <SliderBar
          value={mainGain.val}
          min={0}
          max={50}
          step={1}
          disabled={disabledConvolution}
          onchange={handleUpdateMainGain}
        />
        <span class="value">{mainGain.val * 10}%</span>
      </div>
      <div class="slider-item">
        <span class="label">{$t('player__sound_effect_convolution_send_gain')}</span>
        <SliderBar
          value={sendGain.val}
          min={0}
          max={50}
          step={1}
          disabled={disabledConvolution}
          onchange={handleUpdateSendGain}
        />
        <span class="value">{sendGain.val * 10}%</span>
      </div>
    </div>
  </div>
  <div class="save-list">
    {#each userPresetList.val as item (item.id)}
      <Btn
        min
        onclick={() => {
          handleSetPreset(item)
        }}
        oncontextmenu={(event) => {
          event.preventDefault()
          event.stopPropagation()
          handleRemovePreset(item.id)
        }}>{item.name}</Btn
      >
    {/each}
    {#if userPresetList.val.length < 31}
      <AddPresetBtn
        onsave={(name) => {
          if (!settingState.setting['player.soundEffect.convolution.fileName']) return
          void saveUserConvolutionPreset({
            id: Date.now().toString(),
            name,
            source: settingState.setting['player.soundEffect.convolution.fileName'],
            mainGain: settingState.setting['player.soundEffect.convolution.mainGain'],
            sendGain: settingState.setting['player.soundEffect.convolution.sendGain'],
          })
        }}
        disabled={disabledConvolution}
      />
    {/if}
  </div>
</div>

<style lang="less">
  .contnet {
    display: flex;
    flex: none;
    flex-flow: column nowrap;
    gap: 3px;
    min-height: 0;

    :global {
      .checkbox {
        margin-right: 10px;
        font-size: 12px;
        .label {
          font-size: 12px;
        }
      }
      .slider {
        flex: auto;
      }
    }
  }
  .convolution {
    display: flex;
    flex-flow: column wrap;
    gap: 15px;
    width: 100%;
  }
  .convolution-list {
    display: flex;
    flex-flow: row wrap;
    gap: 8px;
    width: 100%;
  }

  .slider-list {
    display: flex;
    flex-flow: column nowrap;
    gap: 15px;
    width: 100%;
    transition: opacity @transition-normal;
    &.disabled {
      opacity: 0.4;
    }
  }
  .slider-item {
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
  .save-list {
    display: flex;
    flex-flow: row wrap;
    gap: 10px;
    margin-top: 10px;
  }
</style>
