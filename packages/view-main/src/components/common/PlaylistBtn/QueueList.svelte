<script lang="ts">
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import { playInfo, playList } from '@/modules/player/reactive.svelte'
  import ListItem from './ListItem.svelte'
  import Empty from '@/components/material/Empty.svelte'
  import { playerState } from '@/modules/player/store/state'
  import { musicClick } from './shared'

  let listItemHeight = useListItemHeight(3.2)
  let picstyle = $derived(`height:${listItemHeight.val * 0.8}px; width:${listItemHeight.val * 0.8}px;`)
</script>

<div class="container">
  {#if $playList.length}
    <VirtualizedList
      list={$playList}
      initialscrollindex={playerState.playInfo.index}
      initialscrollindexoffset={-100}
      keyname="itemId"
      containerclass="list"
      itemheight={listItemHeight.val}
      contain="content"
      scrollbaroffset="0"
    >
      {#snippet row(item, index)}
        <ListItem
          info={item}
          {picstyle}
          {index}
          playing={$playInfo.index == index}
          onclick={(isKey) => {
            musicClick(index)
            if (isKey) musicClick(index)
          }}
        />
      {/snippet}
    </VirtualizedList>
  {:else}
    <Empty />
  {/if}
</div>

<style lang="less">
  .container {
    display: flex;
    flex: auto;
    flex-direction: column;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }
</style>
