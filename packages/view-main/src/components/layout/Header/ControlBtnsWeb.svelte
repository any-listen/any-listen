<script lang="ts">
  import { t } from '@/plugins/i18n'
  // import { link, location } from '@/plugins/routes'
  import { closeWindow } from '@/shared/ipc/app'
  // import { isFullscreen } from '@/store'

  const handleClose = () => {
    void closeWindow()
  }
</script>

<div class="control">
  <!-- <a
    tabindex="0"
    role="button"
    href="/extenstion"
    use:link
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
    use:link
    class="btn min"
    class:active={$location == '/settings'}
    aria-label={$t('min')}
  >
    <svg class="svg" aria-hidden="true" viewBox="0 0 512 512">
      <use xlink:href="#icon-setting-control" />
    </svg>
  </a> -->
  <button type="button" class="btn close" aria-label={$t('logout')} onclick={handleClose}>
    <svg version="1.1" height="60%" viewBox="0 0 24 24">
      <use xlink:href="#icon-logout" />
    </svg>
  </button>
</div>

<style lang="less">
  .control {
    flex: none;
    display: flex;
    align-self: flex-start;
    -webkit-app-region: no-drag;
    height: 30px;

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 46px;
      height: 30px;
      background: none;
      border: none;
      // outline: none;
      padding: 1px;
      cursor: pointer;
      color: var(--color-font-label);
      transition: background-color 0.2s ease-in-out;
      // &.active {
      //   background-color: var(--color-button-background-hover);
      // }
      &:hover {
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
