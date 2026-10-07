<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    children,
    right,
  }: {
    label?: string
    children?: Snippet
    right?: Snippet
  } = $props()
</script>

<div class="list-form-item">
  {#if label}
    <h4 class="list-form-item-title">{label}</h4>
  {/if}
  {#if children}
    <div class="list-form-item-content">
      {@render children()}
    </div>
  {/if}
  {#if right}
    <div class="list-form-item-right">
      {@render right()}
    </div>
  {/if}
</div>

<style lang="less">
  .list-form-item {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    // min-height: 26px;
  }
  .list-form-item-title {
    flex: none;
    width: 18%;
    font-size: 13px;
    .break;
  }
  .list-form-item-content {
    flex: auto;
    min-width: 0;
    .break;
  }
  .list-form-item-right {
    flex: none;
  }
</style>
