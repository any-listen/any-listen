<script lang="ts">
  let {
    src,
    alt = 'PIC',
    icon = 'night_landscape',
    width = '100%',
    height = '100%',
    loading = 'lazy',
    decoding = 'async',
    onerror,
  }: {
    src?: string | null
    icon?: string
    alt?: string
    width?: number | string
    height?: number | string
    decoding?: 'async' | 'auto' | 'sync'
    loading?: 'lazy' | 'eager'
    onerror?: () => void
  } = $props()
  let isError = $state(false)

  $effect(() => {
    if (src) isError = false
  })
</script>

{#if src && !isError}
  <img
    {src}
    class="pic img"
    {alt}
    style:width
    style:height
    {loading}
    {decoding}
    onerror={() => {
      isError = true
      onerror?.()
    }}
  />
{:else}
  <div style:width style:height class="pic empty-pic">
    <svg version="1.1" viewBox="0 0 192 192" width="78%">
      <use xlink:href={`#icon-${icon}`} />
    </svg>
  </div>
{/if}

<style lang="less">
  .img {
    aspect-ratio: 1;
    // width: 100%;
    // height: 100%;
    object-fit: cover;
    border-radius: @radius-border;
    box-shadow: 0 0 2px var(--color-primary-dark-200-alpha-800);
  }
  .empty-pic {
    // width: 100%;
    // height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    // letter-spacing: 3px;
    aspect-ratio: 1;
    color: var(--color-primary-light-400-alpha-400);
    user-select: none;
    background-color: var(--color-primary-light-200-alpha-900);
    // font-size: 20px;
    // font-family: Consolas, 'Courier New', monospace;
    border-radius: @radius-border;
    box-shadow: 0 0 2px var(--color-primary-dark-200-alpha-800);
  }
</style>
