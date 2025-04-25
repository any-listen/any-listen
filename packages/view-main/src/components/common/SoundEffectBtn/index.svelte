<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { t } from '@/plugins/i18n'
  import AudioConvolution from './AudioConvolution.svelte'
  import BiquadFilter from './BiquadFilter.svelte'
  import PitchShifter from './PitchShifter.svelte'
  import AudioPanner from './AudioPanner.svelte'
  let { teleport }: { teleport?: 'string' } = $props()
  let visible = $state(false)
  const mediaDeviceId = useSettingValue('player.mediaDeviceId')
  let showTip = $derived(mediaDeviceId.val != 'default')
</script>

<button
  class="btn"
  aria-label={$t('player__sound_effect')}
  onclick={() => {
    visible = true
  }}
>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="90%" viewBox="0 0 24 24">
    <use xlink:href="#icon-tune" />
  </svg>
</button>
<Modal bind:visible bgclose {teleport}>
  <!-- <main class="main"> -->
  <!-- <h2 class="title">{{ $t('theme_edit_modal__title') }}</h2> -->
  <div class="content">
    <div class="scroll row">
      <AudioConvolution />
      <PitchShifter />
      <AudioPanner />
    </div>
    <div class="scroll row">
      <BiquadFilter />
    </div>
  </div>
  {#if showTip}
    <p class="tip">{$t('player__sound_effect_features_tip')}</p>
  {/if}
  <!-- </main> -->
</Modal>

<style lang="less">
  .btn {
    position: relative;
    // color: var(--color-button-font);
    justify-content: center;
    align-items: center;
    transition: color @transition-normal;
    cursor: pointer;
    background-color: transparent;
    border: none;
    width: 24px;
    display: flex;
    flex-flow: column nowrap;
    padding: 0;
    // outline: none;

    svg {
      transition: opacity @transition-fast;
      opacity: 0.6;
      // filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
    }
    &:hover {
      svg {
        opacity: 0.9;
      }
    }
    &:active {
      svg {
        opacity: 1;
      }
    }
  }

  // .main {
  //   min-width: 300px;
  //   // max-height: 100%;
  //   // overflow: hidden;
  //   display: flex;
  //   flex-flow: column nowrap;
  //   justify-content: center;
  //   min-height: 0;
  // }
  // .title {
  //   flex: none;
  //   font-size: 16px;
  //   color: var(--color-font);
  //   line-height: 1.3;
  //   text-align: center;
  //   padding: 10px;
  // }
  .content {
    display: flex;
    flex-flow: row nowrap;
    padding: 0 5px;
    margin: 15px 0;
    gap: 10px;
    position: relative;
    min-height: 0;

    &:before {
      .mixin-after();
      position: absolute;
      left: 50%;
      height: 100%;
      border-left: 1px dashed var(--color-primary-light-100-alpha-700);
    }
    // width: 400px;

    :global {
      // .player__sound_effect_contnet {
      //   display: flex;
      // }
      .player__sound_effect_title {
        // margin-bottom: 10px;
        font-size: 14px;
        padding-bottom: 8px;
      }
    }
  }

  .row {
    width: 50%;
    display: flex;
    gap: 15px;
    flex-flow: column nowrap;
    padding: 0 10px;
  }

  .tip {
    padding: 0 15px 15px;
    margin-top: 5px;
    font-size: 12px;
    line-height: 1.25;
    color: var(--color-font);
  }
</style>
