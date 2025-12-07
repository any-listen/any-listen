<script lang="ts">
  import PopupBtn from '@/components/material/PopupBtn.svelte'
  import { t } from '@/plugins/i18n'
  import Checkbox from '../base/Checkbox.svelte'
  import SliderBar from '../base/SliderBar.svelte'
  import type { WheelEventHandler } from 'svelte/elements'
  import { actions } from '@/shared/actions'
  import { volume, volumeMute } from '@/modules/player/reactive.svelte'
  let label = $derived($volumeMute ? $t('player__volume_muted') : `${$t('player__volume')}${Math.trunc($volume * 100)}%`)

  const handleWheel: WheelEventHandler<HTMLButtonElement> = (event) => {
    actions.exec('player.setVolume', Math.round($volume * 100 + (-event.deltaY / 100) * 2) / 100)
  }

  const handleUpdateVolume = (val: number) => {
    actions.exec('player.setVolume', Math.round(val * 100) / 100)
  }

  const handleUpdateVolumeMute = (val: boolean) => {
    actions.exec('player.setVolumeMute', val)
  }

  const icon = $derived(
    $volumeMute
      ? '#icon-volume-mute'
      : $volume == 0
        ? '#icon-volume-off'
        : $volume < 0.3
          ? '#icon-volume-low'
          : $volume < 0.7
            ? '#icon-volume-medium'
            : '#icon-volume-high'
  )
</script>

<PopupBtn onwheel={handleWheel} aria-label={label}>
  <div class="icon">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
      <use xlink:href={icon} />
    </svg>
  </div>
  {#snippet content()}
    <div class="setting">
      <div class="info">
        <span>{Math.trunc($volume * 100)}%</span>
        <Checkbox
          id="player__volume_mute"
          checked={$volumeMute}
          label={$t('player__volume_mute_label')}
          onchange={handleUpdateVolumeMute}
        />
      </div>
      <SliderBar step={0.01} deltaStep={0.02} value={$volume} min={0} max={1} onchange={handleUpdateVolume} />
    </div>
  {/snippet}
</PopupBtn>

<style lang="less">
  // .container {
  //   flex: none;
  //   height: 100%;
  // }

  .icon {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    // color: var(--color-button-font);
    justify-content: center;
    width: 24px;
    padding: 0;
    cursor: pointer;
    transition: color @transition-normal;

    svg {
      opacity: 0.5;
      transition: opacity @transition-fast;
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

  .setting {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
    width: 140px;
    padding: 2px 3px;

    :global(.slider) {
      width: 100%;
    }
  }

  .info {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    span {
      line-height: 1.2;
    }
  }
</style>
