<script lang="ts">
  import type { SettingListItem } from './settings'
  import SettingCommonItem from './SettingCommonItem.svelte'

  let {
    item,
  }: {
    item: SettingListItem
  } = $props()
</script>

<div class="settings-item">
  {#if item.type === 'component'}
    {#await item.component() then Component}
      {#if 'default' in Component}
        <Component.default />
      {:else}
        <Component />
      {/if}
    {/await}
  {:else}
    <SettingCommonItem {item} />
  {/if}
</div>

<style lang="less">
  // .settings-item {
  //   padding-right: 10px;
  // }
</style>
