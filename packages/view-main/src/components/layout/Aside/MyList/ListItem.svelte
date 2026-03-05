<script lang="ts">
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import Image from '@/components/base/Image.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import { location, push, query, replace } from '@/plugins/routes'
  import { useFetchingListStatus, useListCover } from '@/modules/musicLibrary/reactive.svelte'
  import { LIST_PIC_ICON } from '@/shared/constants'
  // console.log(querystring)
  let {
    listInfo,
    picStyle,
    active,
    oncontextmenu,
  }: {
    listInfo: AnyListen.List.MyListInfo
    index: number
    active?: boolean
    picStyle: string
    oncontextmenu?: MouseEventHandler<HTMLDivElement>
  } = $props()

  const fetching = useFetchingListStatus(listInfo.id)

  const listCover = useListCover(listInfo)

  const handleSelect = () => {
    const url = `/library?id=${listInfo.id}`
    if ($location == '/library') {
      void replace(url)
    } else {
      void push(url)
    }
  }
</script>

<div
  class="container"
  class:active={$query.id == listInfo.id || active}
  class:fetching={fetching.val}
  role="button"
  aria-label={listInfo.name}
  data-ignore-tip
  tabindex="0"
  onkeydown={(event) => {
    if (event.repeat) return
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        event.stopPropagation()
        handleSelect()
        break
    }
  }}
  onclick={handleSelect}
  {oncontextmenu}
>
  <div class="left" style={picStyle}>
    <Image src={listCover.val} icon={LIST_PIC_ICON[listInfo.id as keyof typeof LIST_PIC_ICON]} />
  </div>
  <div class="right">
    <span>{listInfo.name}</span>
    <div class="meta">
      <span><SvgIcon name="music" />{listInfo.meta.songCount}</span>
      <!-- <span><SvgIcon name="headphones" /> {listInfo.meta.playCount}</span> -->
    </div>
  </div>
</div>

<style lang="less">
  .container {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: 6px;
    align-items: center;
    height: 100%;
    padding: 6px;
    background-color: transparent;
    border-radius: @radius-border;
    transition: 0.3s ease;
    transition-property: color, background-color, opacity;
    &:not(.active) {
      &:hover {
        cursor: pointer;
        background-color: var(--color-primary-background-hover);
      }
    }
  }
  .active {
    background-color: var(--color-primary-background);
  }
  .fetching {
    opacity: 0.5;
  }

  .left {
    // width: 100%;
    // height: 80%;
    display: flex;
    // color: var(--color-primary-light-400-alpha-200);
    // user-select: none;
    // font-size: 18px;
    // font-family: Consolas, 'Courier New', monospace;
    flex: none;
    align-items: center;
    justify-content: center;
    // background-color: var(--color-primary-light-200-alpha-900);
    border-radius: @radius-border;

    // span {
    //   padding-left: 2px;
    // }

    :global(.pic.empty-pic) {
      color: var(--color-primary-light-100-alpha-400);
      background-color: var(--color-primary-light-200-alpha-700);
    }
  }

  .right {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    gap: 2px;
    min-width: 0;
    font-size: 14px;
    span {
      .mixin-ellipsis-1();
    }
  }

  .meta {
    display: flex;
    flex-flow: row nowrap;
    gap: 12px;
    font-size: 12px;
    color: var(--color-300);
  }
</style>
