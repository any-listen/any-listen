<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    name,
    desc,
    children,
  }: {
    name?: string
    desc?: string
    children?: Snippet
  } = $props()
</script>

<div class="settings-item-title-container">
  <div class="settings-item-title-content">
    {#if name}
      <h4 class="settings-item-title">{name}</h4>
    {/if}
    {#if desc}
      <p class="settings-item-desc">{desc}</p>
    {/if}
  </div>
  {#if children}
    {@render children()}
  {/if}
</div>

<style lang="less">
  .settings-item-title-container {
    margin-bottom: 8px;
  }
  .settings-item-title-content {
    margin-bottom: 8px;
  }
  .settings-item-title {
    font-size: 13px;
  }
  .settings-item-desc {
    font-size: 12px;
    opacity: 0.7;
  }
</style>
