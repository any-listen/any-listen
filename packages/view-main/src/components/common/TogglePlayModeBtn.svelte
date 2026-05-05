<script lang="ts">
  import PopupBtn from '@/components/material/PopupBtn.svelte'
  import { useNextTogglePlay } from '@/shared/compositions/useNextTogglePlay.svelte'
  import { t } from '@/plugins/i18n'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  let popup: PopupBtn

  const nextTogglePlay = useNextTogglePlay()

  const toggleMode = (mode: AnyListen.AppSetting['player.togglePlayMethod']) => {
    popup.hide()
    nextTogglePlay.toggleMode(mode)
  }
</script>

<PopupBtn bind:this={popup} aria-label={nextTogglePlay.name}>
  <div class="btn">
    {#if togglePlayMethod.val == 'listLoop'}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="80%" viewBox="0 0 24 24">
        <use xlink:href="#icon-list-loop" />
      </svg>
    {:else if togglePlayMethod.val == 'random'}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
        <use xlink:href="#icon-list-random" />
      </svg>
    {:else if togglePlayMethod.val == 'singleLoop'}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
        <use xlink:href="#icon-list-single-loop" />
      </svg>
    {:else if togglePlayMethod.val == 'list'}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
        <use xlink:href="#icon-list-order" />
      </svg>
    {:else if togglePlayMethod.val == 'none'}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
        <use xlink:href="#icon-unavailable" />
      </svg>
    {/if}
  </div>
  {#snippet content()}
    <div class="setting">
      <button
        class="btn"
        aria-label={$t('player__play_toggle_mode_list_loop')}
        onclick={() => {
          toggleMode('listLoop')
        }}
      >
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 24 24">
          <use xlink:href="#icon-list-loop" />
        </svg>
      </button>
      <button
        class="btn"
        aria-label={$t('player__play_toggle_mode_random')}
        onclick={() => {
          toggleMode('random')
        }}
      >
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
          <use xlink:href="#icon-list-random" />
        </svg>
      </button>
      <button
        class="btn"
        aria-label={$t('player__play_toggle_mode_list')}
        onclick={() => {
          toggleMode('list')
        }}
      >
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 32 32">
          <use xlink:href="#icon-list-order" />
        </svg>
      </button>
      <button
        class="btn"
        aria-label={$t('player__play_toggle_mode_single_loop')}
        onclick={() => {
          toggleMode('singleLoop')
        }}
      >
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
          <use xlink:href="#icon-list-single-loop" />
        </svg>
      </button>
      <button
        class="btn"
        aria-label={$t('player__play_toggle_mode_none')}
        onclick={() => {
          toggleMode('none')
        }}
      >
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
          <use xlink:href="#icon-unavailable" />
        </svg>
      </button>
    </div>
  {/snippet}
</PopupBtn>

<style lang="less">
  .btn {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    // color: var(--color-button-font);
    justify-content: center;
    width: 24px;
    padding: 0;
    cursor: pointer;
    background-color: transparent;
    border: none;
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
    flex-flow: row nowrap;
    gap: 10px;
    font-size: 14px;
  }
</style>
