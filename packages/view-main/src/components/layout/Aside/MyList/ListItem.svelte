<script lang="ts">
  // import SvgIcon from '@/components/base/SvgIcon.svelte'
  // import Image from '@/components/base/Image.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import { location, push, query, replace } from '@/plugins/routes'
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
  <!-- <div class="container" role="button" tabindex="0" onkeydown={log} onclick={log} {oncontextmenu}> -->
  <div class="left" style={picStyle}>
    <!-- <Image /> -->
  </div>
  <div class="right">
    <span>{listInfo.name}</span>
    <!-- <div class="meta">
      <span><SvgIcon name="music" /> {100}</span>
      <span><SvgIcon name="headphones" /> {listInfo.meta.playCount}</span>
    </div> -->
  </div>
</div>

<style lang="less">
  .container {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 100%;
    padding: 5px 2px;
    gap: 10px;
    position: relative;
    transition: 0.3s ease;
    transition-property: color, background-color, opacity;
    background-color: transparent;
    border-radius: @radius-border;
    &:not(.active) {
      &:hover {
        background-color: var(--color-primary-background-hover);
        cursor: pointer;
      }
    }
  }
  .active {
    background-color: var(--color-primary-background);
  }

  .left {
    // background-color: var(--color-primary-light-200-alpha-900);
    border-radius: @radius-border;
    // width: 100%;
    // height: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    // color: var(--color-primary-light-400-alpha-200);
    // user-select: none;
    // font-size: 18px;
    // font-family: Consolas, 'Courier New', monospace;
    flex: none;

    // span {
    //   padding-left: 2px;
    // }
  }

  .right {
    flex: auto;
    display: flex;
    flex-flow: column nowrap;
    font-size: 14px;
    gap: 2px;
    min-width: 0;
    span {
      .mixin-ellipsis-1();
    }
  }

  // .meta {
  //   display: flex;
  //   flex-flow: row nowrap;
  //   gap: 12px;
  //   color: var(--color-300);
  //   font-size: 12px;
  // }
</style>
