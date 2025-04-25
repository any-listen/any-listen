<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import SliderBar from '@/components/base/SliderBar.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import { settingState } from '@/modules/setting/store/state'
  import { removeUserEQPreset, saveUserEQPreset } from '@/modules/soundEffect/store/actions'
  import { t } from '@/plugins/i18n'
  import { freqs, freqsPreset, setMediaDeviceId } from '@/plugins/player'
  import { useUserEqPresetList } from '@/modules/soundEffect/reactive.svelte'
  import AddPresetBtn from './AddPresetBtn.svelte'
  const userPresetList = useUserEqPresetList()
  const settings = {
    31: useSettingValue('player.soundEffect.biquadFilter.hz31'),
    62: useSettingValue('player.soundEffect.biquadFilter.hz62'),
    125: useSettingValue('player.soundEffect.biquadFilter.hz125'),
    250: useSettingValue('player.soundEffect.biquadFilter.hz250'),
    500: useSettingValue('player.soundEffect.biquadFilter.hz500'),
    1000: useSettingValue('player.soundEffect.biquadFilter.hz1000'),
    2000: useSettingValue('player.soundEffect.biquadFilter.hz2000'),
    4000: useSettingValue('player.soundEffect.biquadFilter.hz4000'),
    8000: useSettingValue('player.soundEffect.biquadFilter.hz8000'),
    16000: useSettingValue('player.soundEffect.biquadFilter.hz16000'),
  } as const

  const labels = freqs.map((num) => (num < 1000 ? num : `${num / 1000}k`))

  const handleUpdate = async (key: (typeof freqs)[number], value: number) => {
    const setting: Partial<AnyListen.AppSetting> = {}
    if (settingState.setting['player.mediaDeviceId'] != 'default') {
      await setMediaDeviceId('default').catch(() => {})
      setting['player.mediaDeviceId'] = 'default'
    }

    value = Math.round(value)
    // values[index] = value
    setting[`player.soundEffect.biquadFilter.hz${key}`] = value
    void updateSetting(setting)
  }

  const handleReset = () => {
    const setting: Partial<AnyListen.AppSetting> = {}
    for (const key of freqs) {
      setting[`player.soundEffect.biquadFilter.hz${key}`] = 0
    }
    void updateSetting(setting)
  }

  const handleSetPreset = (item: Omit<AnyListen.SoundEffect.EQPreset, 'id'>) => {
    void updateSetting({
      'player.soundEffect.biquadFilter.hz31': item.hz31,
      'player.soundEffect.biquadFilter.hz62': item.hz62,
      'player.soundEffect.biquadFilter.hz125': item.hz125,
      'player.soundEffect.biquadFilter.hz250': item.hz250,
      'player.soundEffect.biquadFilter.hz500': item.hz500,
      'player.soundEffect.biquadFilter.hz1000': item.hz1000,
      'player.soundEffect.biquadFilter.hz2000': item.hz2000,
      'player.soundEffect.biquadFilter.hz4000': item.hz4000,
      'player.soundEffect.biquadFilter.hz8000': item.hz8000,
      'player.soundEffect.biquadFilter.hz16000': item.hz16000,
    })
  }
</script>

<div class="contnet">
  <div class="player__sound_effect_title header">
    <h3>{$t('player__sound_effect_biquad_filter')}</h3>
    <Btn min onclick={handleReset}>{$t('player__sound_effect_reset_btn')}</Btn>
  </div>
  <div class="eqList">
    {#each freqs as v, i (v)}
      <div class="eqItem">
        <span class="label">{labels[i]}</span>
        <SliderBar
          value={settings[v].val}
          min={-15}
          max={15}
          step={1}
          onchange={(val) => {
            void handleUpdate(v, val)
          }}
        />
        <span class="value">{settings[v].val}db</span>
      </div>
    {/each}
  </div>
  <div class="saveList">
    {#each freqsPreset as item (item.name)}
      <Btn
        min
        onclick={() => {
          handleSetPreset(item)
        }}
      >
        {$t(`player__sound_effect_biquad_filter_preset_${item.name}`)}
      </Btn>
    {/each}
    {#each userPresetList.val as item (item.id)}
      <Btn
        min
        onclick={() => {
          handleSetPreset(item)
        }}
        oncontextmenu={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void removeUserEQPreset(item.id)
        }}>{item.name}</Btn
      >
    {/each}
    {#if userPresetList.val.length < 31}
      <AddPresetBtn
        onsave={(name) => {
          void saveUserEQPreset({
            id: Date.now().toString(),
            name,
            hz31: settingState.setting['player.soundEffect.biquadFilter.hz31'],
            hz62: settingState.setting['player.soundEffect.biquadFilter.hz62'],
            hz125: settingState.setting['player.soundEffect.biquadFilter.hz125'],
            hz250: settingState.setting['player.soundEffect.biquadFilter.hz250'],
            hz500: settingState.setting['player.soundEffect.biquadFilter.hz500'],
            hz1000: settingState.setting['player.soundEffect.biquadFilter.hz1000'],
            hz2000: settingState.setting['player.soundEffect.biquadFilter.hz2000'],
            hz4000: settingState.setting['player.soundEffect.biquadFilter.hz4000'],
            hz8000: settingState.setting['player.soundEffect.biquadFilter.hz8000'],
            hz16000: settingState.setting['player.soundEffect.biquadFilter.hz16000'],
          })
        }}
      />
    {/if}
  </div>
</div>

<style lang="less">
  .contnet {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
    min-height: 0;
    flex: none;

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
  .eqList {
    display: flex;
    flex-flow: row wrap;
    // gap: 15px;
    width: 100%;
    justify-content: space-between;
    position: relative;

    &:before {
      .mixin-after();
      position: absolute;
      left: 50%;
      height: 100%;
      border-left: 1px dashed var(--color-primary-light-100-alpha-700);
    }
  }
  .eqItem {
    display: flex;
    flex-flow: row nowrap;
    width: 50%;
    gap: 8px;
    margin-bottom: 15px;
    &:nth-child(odd) {
      padding-right: 10px;
    }
    &:nth-child(even) {
      padding-left: 10px;
    }
    &:nth-last-child(1),
    &:nth-last-child(2) {
      margin-bottom: 0;
    }
  }
  .label {
    flex: none;
    width: 40px;
    font-size: 12px;
    text-align: center;
  }
  .value {
    flex: none;
    width: 40px;
    font-size: 12px;
    text-align: center;
  }
  // .footer {
  //   display: flex;
  //   flex-flow: row nowrap;
  //   // justify-content: space-between;
  //   justify-content: center;
  //   align-items: center;
  //   // font-size: 13px;
  //   span {
  //     line-height: 1.2;
  //   }
  // }

  .saveList {
    display: flex;
    flex-flow: row wrap;
    margin-top: 10px;
    gap: 10px;
  }
</style>
