<script lang="ts">
  import { useIsFullscreen } from '@/modules/app/reactive.svelte'
  import { t } from '@/plugins/i18n'
  import { setMaximized } from '@/shared/browser/widnow.svelte'
  // import { link, location } from '@/plugins/routes'
  import { closeWindow } from '@/shared/ipc/app'
  // import { isFullscreen } from '@/store'

  const fullscreenState = useIsFullscreen()

  const handleClose = () => {
    void closeWindow()
  }
</script>

<div class="control">
  <!-- <a
    tabindex="0"
    role="button"
    href="/extenstion"
    {@attach link()}
    class="btn min"
    class:active={$location == '/extenstion'}
    aria-label={$t('min')}
  >
    <svg class="svg" aria-hidden="true" viewBox="0 0 50 50">
      <use xlink:href="#icon-extenstion" />
    </svg>
  </a>
  <a
    tabindex="0"
    role="button"
    href="/settings"
    {@attach link()}
    class="btn min"
    class:active={$location == '/settings'}
    aria-label={$t('min')}
  >
    <svg class="svg" aria-hidden="true" viewBox="0 0 512 512">
      <use xlink:href="#icon-setting-control" />
    </svg>
  </a> -->
  <button
    type="button"
    class="btn fullscreen"
    aria-pressed={fullscreenState.isFullscreen}
    aria-label={fullscreenState.isFullscreen ? $t('maximized_exit') : $t('maximized')}
    onclick={() => {
      setMaximized(!fullscreenState.isFullscreen)
    }}
  >
    <svg version="1.1" height="60%" viewBox="0 0 24 24">
      <use xlink:href={fullscreenState.isFullscreen ? '#icon-window-restore' : '#icon-window-maximize'} />
    </svg>
  </button>
  <button type="button" class="btn close" aria-label={$t('logout')} onclick={handleClose}>
    <svg version="1.1" height="60%" viewBox="0 0 24 24">
      <use xlink:href="#icon-logout" />
    </svg>
  </button>
</div>

<style lang="less">
  .control {
    display: flex;
    flex: none;
    align-self: flex-start;
    height: 30px;

    .btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 30px;
      // outline: none;
      padding: 1px;
      color: var(--color-font-label);
      cursor: pointer;
      background: none;
      border: none;
      transition: background-color 0.2s ease-in-out;
      // &.active {
      //   background-color: var(--color-button-background-hover);
      // }
      &:hover {
        background-color: var(--color-button-background-hover);
        // &.min {
        //   background-color: var(--color-button-background-hover);
        // }
        &.close {
          background-color: var(--color-btn-close);
        }
      }
    }
  }

  // .svg {
  //   height: 16px;
  // }
</style>
