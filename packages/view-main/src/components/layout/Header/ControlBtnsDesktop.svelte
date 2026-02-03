<script lang="ts">
  import { appEvent } from '@/modules/app/store/event'
  import { t } from '@/plugins/i18n'
  // import { link, location } from '@/plugins/routes'
  import { closeWindow, minWindow } from '@/shared/ipc/app'
  import { onMount } from 'svelte'
  let domBtns = $state<HTMLDivElement>()

  // import { isFullscreen } from '@/store'

  onMount(() => {
    const getBtnEl = (el: HTMLElement | null): HTMLButtonElement | null => {
      return el ? (el.tagName == 'BUTTON' ? (el as HTMLButtonElement) : getBtnEl(el.parentNode as HTMLElement | null)) : null
    }
    const handleMouseover = (event: MouseEvent) => {
      const btn = getBtnEl(event.target as HTMLElement)
      if (!btn) return
      btn.classList.add('hover')
    }
    const handleMouseout = (event: MouseEvent) => {
      const btn = getBtnEl(event.target as HTMLElement)
      if (!btn) return
      btn.classList.remove('hover')
    }

    const unsub = appEvent.on('focus', () => {
      if (!domBtns) return
      for (const node of domBtns.childNodes) {
        if ((node as HTMLElement).tagName != 'BUTTON') continue
        ;(node as HTMLElement).classList.remove('hover')
      }
    })
    domBtns!.addEventListener('mouseover', handleMouseover)
    domBtns!.addEventListener('mouseout', handleMouseout)
    return () => {
      unsub()
      domBtns!.removeEventListener('mouseover', handleMouseover)
      domBtns!.removeEventListener('mouseout', handleMouseout)
    }
  })
</script>

<div class="control no-drag" bind:this={domBtns}>
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
  <button type="button" class="btn min" aria-label={$t('min')} onclick={minWindow}>
    <svg version="1.1" class="svg" viewBox="0 0 24 24">
      <use xlink:href="#icon-window-minimize-2" />
    </svg>
  </button>
  <button type="button" class="btn close" aria-label={$t('close')} onclick={closeWindow}>
    <svg version="1.1" class="svg" viewBox="0 0 24 24">
      <use xlink:href="#icon-window-close-2" />
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
      &:global(.hover) {
        &.min {
          background-color: var(--color-button-background-hover);
        }
        &.close {
          background-color: var(--color-btn-close);
        }
      }
    }
  }

  .svg {
    height: 16px;
  }
</style>
