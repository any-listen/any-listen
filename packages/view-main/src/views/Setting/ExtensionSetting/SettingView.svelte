<script lang="ts">
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import SettingItem from './SettingItem.svelte'

  let {
    id,
    name,
    list,
  }: {
    id: string
    name: string
    list: AnyListen.Extension.FormValueItem[]
  } = $props()
</script>

<div class="settings-list-container">
  <div class="settings-list" {@attach verticalScrollbar()}>
    <h3 class="settings-title">{name}</h3>
    {#each list as item (item.field)}
      <SettingItem {id} {item} />
    {/each}
  </div>
</div>

<style lang="less">
  .settings-list-container {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-width: 0;
    overflow: hidden;
  }
  .settings-list {
    position: relative;
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-height: 0;
    margin: 0 10px;
    // gap: 8px;
  }
</style>
