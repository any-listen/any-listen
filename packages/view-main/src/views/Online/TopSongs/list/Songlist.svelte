<script lang="ts">
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import ListItem from './ListItem.svelte'
  import Loading from '@/components/base/Loading.svelte'
  import Empty from '@/components/material/Empty.svelte'

  let {
    list,
    listInfo,
    sId,
    onreload,
  }: {
    list: AnyListen.Resource.TopSongsItem[]
    listInfo: {
      loading: boolean
      error: boolean
    }
    sId: string
    onreload?: () => void
  } = $props()
</script>

<div class="songlist-list">
  <div class="list-container">
    <ul {@attach verticalScrollbar({ offset: '0.22rem' })}>
      {#each list as item (item.id)}
        <ListItem {item} {sId} />
      {/each}
    </ul>
  </div>
  {#if !list.length && !listInfo.loading && !listInfo.error}
    <Empty />
  {/if}
  <Loading loading={listInfo.loading} error={listInfo.error} {onreload} />
</div>

<style lang="less">
  .songlist-list {
    position: relative;
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .list-container {
    position: relative;
    display: flex;
    flex: auto;
    min-height: 0;
    // margin-top: 15px;

    ul {
      display: grid;
      flex: 1;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 24px;
      align-content: flex-start;
      min-height: 0;
      padding: 0 16px 16px;
      overflow: hidden;
    }
  }
</style>
