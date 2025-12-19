<script lang="ts">
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import SettingItem from './SettingItem.svelte'
  import type { SettingListSection, SettingListItem } from './settings'
  import { t } from '@/plugins/i18n'
  let {
    settings,
  }: {
    settings: SettingListSection
  } = $props()
  // $inspect(list)
  let filterList = $derived(settings.list.filter((item) => item) as SettingListItem[])
</script>

<div class="settings-list-container">
  <div class="settings-list" {@attach verticalScrollbar()}>
    <h3 class="settings-title">{$t(settings.name)}</h3>
    {#each filterList as item (item.name)}
      <SettingItem {item} />
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
    // gap: 14px;
  }
</style>
