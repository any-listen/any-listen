<script lang="ts">
  import { windowDarg } from '@/shared/browser/widnow.svelte'
  import { t } from '@/plugins/i18n'
  import { setShowPlayDetail } from '@/modules/playDetail/store/commit'
  import { onMount } from 'svelte'
  import { appEvent } from '@/modules/app/store/event'

  let domBtns = $state<HTMLDivElement>()

  let isFullscreen = false

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

{#snippet content()}
  <div bind:this={domBtns} class="control-btn no-drag">
    <button
      type="button"
      class="hide"
      data-ignore-tip
      aria-label={$t('play_detail.hide_tip')}
      title={$t('play_detail.hide_tip')}
      onclick={() => {
        setShowPlayDetail(false)
      }}
    >
      <svg version="1.1" height="35%" viewBox="0 0 30.727 30.727">
        <use xlink:href="#icon-window-hide" />
      </svg>
    </button>
  </div>
{/snippet}

{#if import.meta.env.VITE_IS_DESKTOP}
  <div class="header drag" class:fullscreen={isFullscreen}>
    {@render content()}
  </div>
{/if}
{#if import.meta.env.VITE_IS_WEB}
  <div class="header" class:fullscreen={isFullscreen} {@attach windowDarg}>
    {@render content()}
  </div>
{/if}

<style lang="less">
  :global(.fullscreen) {
    .header {
      align-self: flex-start;
      // .control-btn {
      //   .close,
      //   .min {
      //     display: none;
      //   }
      //   .fullscreenExit {
      //     display: flex;
      //   }
      // }
    }
  }
  .header {
    position: relative;
    flex: none;
    flex: 0 0 @height-toolbar;
    align-self: flex-start;
    width: 100%;

    .control-btn {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;

      button {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 30px;
        padding: 1px;
        color: var(--color-font-label);
        cursor: pointer;
        outline: none;
        background: none;
        border: none;
        transition: background-color 0.2s ease-in-out;

        &:global(.hover) {
          background-color: var(--color-button-background-hover);

          &.close {
            background-color: var(--color-btn-close);
          }
        }
      }

      // .fullscreenExit {
      //   display: none;
      // }
    }
  }
</style>
