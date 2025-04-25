<script lang="ts">
  import VirtualizedList from '@/components/base/VirtualizedList.svelte'
  import { useListItemHeight } from '@/modules/app/reactive.svelte'
  import Menu from './Menu.svelte'
  import ListItem from './ListItem.svelte'
  import { musicClick, playMusic } from './action'
  import { playMusicInfo } from '@/modules/player/reactive.svelte'
  import Header from './Header.svelte'
  import type { ListInfo } from '../type'
  import { useSelect } from './useSelect.svelte'
  import { useHotkey } from './useHotkey.svelte'
  import SearchList from './components/SearchList.svelte'
  import DuplicateMusicModal from './components/DuplicateMusicModal/index.svelte'
  import { type ComponentExports, onMount, untrack } from 'svelte'
  import Empty from '@/components/material/Empty.svelte'
  import ListSortModal from './components/ListSortModal.svelte'
  import { appEvent } from '@/modules/app/store/event'

  let {
    local,
    listinfo,
    list,
    multimode = $bindable(),
    finding = $bindable(),
    duplicate = $bindable(),
    listsort = $bindable(),
    onscroll,
  }: {
    listinfo: ListInfo
    list: AnyListen.Music.MusicInfo[]
    local: boolean
    multimode: boolean
    finding: boolean
    duplicate: boolean
    listsort: boolean
    onscroll?: (pos: number) => void
  } = $props()

  let virtualizedList = $state<ComponentExports<typeof VirtualizedList<AnyListen.Music.MusicInfo>> | null>(null)

  let playingIndex = $derived(
    $playMusicInfo?.listId == listinfo.id ? list.findIndex((m) => m.id == $playMusicInfo.musicInfo.id) : -1
  )
  let listItemHeight = useListItemHeight(3.2)
  let picwidth = $derived(listItemHeight.val * 0.8)
  let picStyle = $derived(`height:${picwidth}px; width:${picwidth}px;`)
  let activeIndex = $state(-1)
  let itv: number | null = null
  let unmounted = false
  const clearIntv = () => {
    if (!itv) return
    clearInterval(itv)
    itv = null
  }

  const scrollToIndex = (idx: number, animate = true) => {
    clearIntv()
    virtualizedList?.scrollToIndex(idx, -100, animate, (end) => {
      if (!end || unmounted) return
      clearIntv()
      activeIndex = idx
      let count = 0
      let curItv = (itv = setInterval(() => {
        if (curItv != itv) return
        activeIndex = ++count % 2 ? -1 : idx
        if (count > 2) clearIntv()
      }, 400))
    })
  }
  let select = useSelect({
    get isShiftDown() {
      return hotkey.isShiftDown
    },
    get list() {
      return list
    },
  })
  let hotkey = useHotkey({
    getListEl() {
      return virtualizedList?.getListEl()
    },
    selectAll() {
      multimode ||= true
      select.override([...list])
    },
  })

  let menu = $state<ComponentExports<typeof Menu> | null>(null)
  $effect(() => {
    if (multimode) {
      untrack(() => {
        const len = list.length
        if (select.selectIndex < len) return
        select.setSelectIndex(len ? len - 1 : 0)
      })
    } else {
      select.clearSelect()
    }
  })
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    list
    select.clearSelect()
  })
  onMount(() => {
    const unsub = appEvent.on('scrollListTo', (listId, musicId) => {
      if (listinfo.id != listId) return
      const idx = list.findIndex((m) => m.id == musicId)
      if (idx < 0) return
      scrollToIndex(idx)
    })
    return () => {
      if (itv) clearInterval(itv)
      unmounted = true
      unsub()
    }
  })
  export const setScrollPosition = (number: number, animate?: boolean) => {
    virtualizedList?.scrollTo(number, animate)
  }
  export const setScrollIndex = (number: number, animate = false) => {
    scrollToIndex(number, animate)
  }
  export const getScrollPosition = () => {
    return virtualizedList?.getScrollTop() ?? 0
  }
</script>

<Header
  {multimode}
  {picwidth}
  selectall={list.length > 0 && select.list.length == list.length}
  disabledselect={!list.length}
  onselectall={(all) => {
    select.override(all ? [...list] : [])
  }}
/>
{#if list.length}
  <div class="container">
    <VirtualizedList
      {list}
      keyname="id"
      itemheight={listItemHeight.val}
      bind:this={virtualizedList}
      containerclass="my-list"
      {onscroll}
    >
      {#snippet row(item, index)}
        <ListItem
          musicinfo={item}
          listid={listinfo.id}
          active={activeIndex == index}
          selected={select.list.includes(item)}
          selectedactive={hotkey.isShiftDown && select.selectIndex == index}
          {index}
          {picStyle}
          playing={playingIndex == index}
          oncontextmenu={(event) => {
            event.preventDefault()
            event.stopPropagation()
            activeIndex = index
            menu!.show(
              {
                listId: listinfo.id,
                musicInfo: item,
                selectedList: select.list,
                onRemoveAllSelected() {
                  multimode = false
                },
              },
              { x: event.pageX, y: event.pageY }
            )
          }}
          onclick={(isKey) => {
            if (multimode || hotkey.isKeyMultiKeyDown()) {
              multimode ||= true
              select.handleSelect(index)
            } else {
              select.setSelectIndex(index)
              void musicClick(listinfo.id, item)
              if (isKey) void musicClick(listinfo.id, item)
            }
          }}
        />
      {/snippet}
    </VirtualizedList>
    <Menu
      bind:this={menu}
      {local}
      onhide={() => {
        activeIndex = -1
      }}
    />
  </div>
{:else}
  <Empty />
{/if}
<SearchList
  bind:visible={finding}
  {list}
  onselect={(idx, isPlay) => {
    if (isPlay) {
      void playMusic(listinfo.id, list[idx])
    } else {
      scrollToIndex(idx)
    }
  }}
/>
<DuplicateMusicModal bind:visible={duplicate} {listinfo} />
<ListSortModal bind:visible={listsort} {listinfo} />

<style lang="less">
  .container {
    flex: auto;
    min-height: 0;
    // padding: 0 5px;
    margin: 0 6px;
    overflow: hidden;
  }
</style>
