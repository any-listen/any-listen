<script lang="ts">
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import Modal from '@/components/material/Modal.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import ListItem from './ListItem.svelte'
  import type { ListInfo } from '../../../type'
  import { workers } from '@/worker'
  import { getListMusics } from '@/modules/musicLibrary/actions'
  import { playMusic, removeMusic } from '../../action'
  import Empty from '@/components/material/Empty.svelte'
  import type { DuplicateMusicItem } from '@/worker/main/list'
  let {
    visible = $bindable(),
    listinfo,
  }: {
    visible: boolean
    listinfo: ListInfo
  } = $props()

  let duplicateList = $state.raw<DuplicateMusicItem[]>([])

  let listItemHeight = useListItemHeight(3.2)

  const handleFilterList = async () => {
    duplicateList = await workers.main.filterDuplicateMusic(await getListMusics(listinfo.id))
  }

  const handleRemoveList = (list: DuplicateMusicItem[], index: number) => {
    let prev = list[index - 1]
    let cur = list[index]
    let next = list[index + 1]
    let count = 1
    if (prev?.group != cur.group) {
      if (next?.group == cur.group && list[index + 2]?.group != cur.group) {
        count = 2
      }
    } else if (next?.group != cur.group) {
      if (prev?.group == cur.group && list[index - 2]?.group != cur.group) {
        index -= 1
        count = 2
      }
    }

    return list.splice(index, count)
  }

  const handleRemove = async (index: number) => {
    let curItem = duplicateList[index]
    handleRemoveList(duplicateList, index)
    await removeMusic(listinfo.id, curItem.musicInfo, [])
    duplicateList = [...duplicateList]
  }

  const handlePlay = (index: number) => {
    const { musicInfo } = duplicateList[index]
    void playMusic(listinfo.id, musicInfo)
  }

  $effect(() => {
    if (visible) {
      void handleFilterList()
    } else {
      duplicateList = []
    }
  })
</script>

<Modal bind:visible bgclose teleport="#view" width="65%" maxwidth="56rem" maxheight="80%">
  <div class="header">
    <h2>{listinfo.name}</h2>
  </div>
  <div class="main">
    {#if duplicateList.length}
      <VirtualizedList
        list={duplicateList}
        keyname="id"
        containerclass="list"
        itemheight={listItemHeight.val}
        contain="content"
        scrollbaroffset="0"
      >
        {#snippet row(item, index)}
          <ListItem
            info={item}
            onplay={() => {
              handlePlay(index)
            }}
            onremove={async () => {
              await handleRemove(index)
            }}
          />
        {/snippet}
      </VirtualizedList>
    {:else}
      <Empty />
    {/if}
  </div>
</Modal>

<style lang="less">
  .header {
    flex: none;
    padding: 15px;
    text-align: center;
    h2 {
      word-break: break-all;
    }
  }

  .main {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-height: 0;
    // min-height: 300px;

    :global(.list) {
      min-width: 460px;
      min-height: 200px;
      font-size: 13px;
      transition-property: height;
    }
  }
</style>
