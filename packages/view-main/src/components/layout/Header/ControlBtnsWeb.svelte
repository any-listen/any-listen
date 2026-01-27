<script lang="ts">
  import { t } from '@/plugins/i18n'
  import { setFullScreen } from '@/modules/app/store/action'
  import { useIsFullscreen } from '@/modules/app/reactive.svelte'
  // import { link, location } from '@/plugins/routes'
  import { closeWindow } from '@/shared/ipc/app'
  // import { isFullscreen } from '@/store'
  import { onMount } from 'svelte'

  const handleClose = () => {
    void closeWindow()
  }

  const fullscreenState = useIsFullscreen()
  let prevBodyStyle: {
    position: string
    left: string
    top: string
    width: string
    height: string
  } | null = null

  const clearBodyInlineSize = () => {
    document.body.style.removeProperty('position')
    document.body.style.removeProperty('left')
    document.body.style.removeProperty('top')
    document.body.style.removeProperty('width')
    document.body.style.removeProperty('height')
  }

  const applyBodyInlineSize = () => {
    if (!prevBodyStyle) return
    document.body.style.position = prevBodyStyle.position
    document.body.style.left = prevBodyStyle.left
    document.body.style.top = prevBodyStyle.top
    document.body.style.width = prevBodyStyle.width
    document.body.style.height = prevBodyStyle.height
  }

  const syncFullscreen = (val: boolean) => {
    document.documentElement.classList.toggle('fullscreen', val)
    if (val) {
      prevBodyStyle = {
        position: document.body.style.position,
        left: document.body.style.left,
        top: document.body.style.top,
        width: document.body.style.width,
        height: document.body.style.height,
      }
      clearBodyInlineSize()
    } else {
      applyBodyInlineSize()
      prevBodyStyle = null
    }
    setFullScreen(val)
  }

  const toggleFullscreen = () => {
    syncFullscreen(!fullscreenState.isFullscreen)
  }

  onMount(() => {
    if (document.documentElement.classList.contains('fullscreen')) {
      setFullScreen(true)
    }
  })
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
    aria-label={fullscreenState.isFullscreen ? $t('fullscreen_exit') : $t('fullscreen')}
    title={fullscreenState.isFullscreen ? $t('fullscreen_exit') : $t('fullscreen')}
    onclick={toggleFullscreen}
  >
    <svg version="1.1" height="60%" viewBox="0 0 24 24">
      <use
        xlink:href={fullscreenState.isFullscreen ? '#icon-window-fullscreen-exit' : '#icon-window-fullscreen'}
      />
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
    -webkit-app-region: no-drag;

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
