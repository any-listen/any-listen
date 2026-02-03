<script lang="ts">
  import { windowDarg } from '@/shared/browser/widnow.svelte'
  import { onDomSizeChanged } from '@any-listen/web'
  import { onMount } from 'svelte'
  let contentDom = $state<HTMLElement>()
  const sizes = $state({ logo: '20%', name: '60%' })

  onMount(() => {
    let preWidth = 0
    return onDomSizeChanged(contentDom!, (width, height) => {
      if (width % 2 !== 0) {
        width += 1
      }
      if (preWidth == width) return
      preWidth = width
      requestAnimationFrame(() => {
        sizes.logo = `${Math.trunc(width * 0.18)}px`
        sizes.name = `${Math.trunc(width * 0.6)}px`
      })
    })
  })
</script>

{#snippet logo()}
  <svg class="header-logo" aria-hidden="true" viewBox="0 0 132.14 92.1" width={sizes.logo}>
    <use xlink:href="#icon-header-logo" />
  </svg>
  <svg class="header-name" aria-hidden="true" viewBox="0 0 608.98 115.52" width={sizes.name}>
    <use xlink:href="#icon-header-name" />
  </svg>
{/snippet}

{#if import.meta.env.VITE_IS_DESKTOP}
  <div class="aside-logo drag" bind:this={contentDom}>
    {@render logo()}
  </div>
{/if}
{#if import.meta.env.VITE_IS_WEB}
  <div class="aside-logo" {@attach windowDarg} bind:this={contentDom}>
    {@render logo()}
  </div>
{/if}

<style lang="less">
  .aside-logo {
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
    align-items: flex-end;
    padding: 20px;
    // font-weight: bold;
    color: var(--color-primary-dark-100-alpha-200);
    svg {
      filter: drop-shadow(0 0 4px rgb(0 0 0 / 16%));
    }
  }
  .header-logo {
    min-width: 26px;
    // color: var(--color-primary-dark-100-alpha-200);
    max-width: 40px;
  }
  .header-name {
    min-width: 86px;
    max-width: 120px;
  }
</style>
