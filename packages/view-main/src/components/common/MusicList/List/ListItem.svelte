<script lang="ts">
  import Badge from '@/components/base/Badge.svelte'
  import Image from '@/components/base/Image.svelte'

  // import SvgIcon from '@/components/base/SvgIcon.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { buildSourceLabel } from '@any-listen/common/tools'
  import { onMount, tick } from 'svelte'
  import { getMusicPicDelay } from '@/modules/player/store/actions'
  // console.log(querystring)
  let {
    musicinfo,
    listid,
    picStyle,
    selected,
    selectedactive,
    playing,
    active,
    oncontextmenu,
    onclick,
  }: {
    musicinfo: AnyListen.Music.MusicInfo
    listid: string
    index: number
    picStyle: string
    playing?: boolean
    selected?: boolean
    active?: boolean
    selectedactive?: boolean
    oncontextmenu?: MouseEventHandler<HTMLDivElement>
    onclick: (isKey: boolean) => void
  } = $props()

  let sourceLabel = $derived(buildSourceLabel(musicinfo))
  let picUrl = $state<null | string>(null)
  // let isPlaying = $derived(isplaylist && $playInfo.index === index)

  const handleClick = (event: KeyboardEvent | Event) => {
    if ('key' in event) {
      if (event.repeat || event.key != 'Enter') return
      onclick(true)
    } else {
      onclick(false)
    }
  }

  onMount(() => {
    return getMusicPicDelay({ musicInfo: musicinfo, listId: listid }, (url) => {
      void tick().then(() => {
        picUrl = url
      })
    })
  })
</script>

<div
  class="container"
  class:selected
  class:active
  class:selectedactive
  role="button"
  tabindex="0"
  onkeydown={handleClick}
  onclick={handleClick}
  {oncontextmenu}
>
  <div class="pic" style={picStyle}>
    {#if playing}
      <div class="play-icon" transition:fade={{ delay: 200 }}>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <use xlink:href="#icon-play" />
        </svg>
      </div>
    {/if}
    <Image src={picUrl} />
  </div>
  <div class="list-item-cell auto name">
    <div class="select name" aria-label={musicinfo.name}>{musicinfo.name}</div>
    {#if sourceLabel}
      <Badge label={sourceLabel} opacity={0.7} />
    {/if}
  </div>
  <div class="list-item-cell" style="flex: 0 0 22%;">
    <span class="select" aria-label={musicinfo.singer}>{musicinfo.singer}</span>
  </div>
  <div class="list-item-cell" style="flex: 0 0 22%;">
    <span class="select" aria-label={musicinfo.meta.albumName}>{musicinfo.meta.albumName}</span>
  </div>
  <div class="list-item-cell" style="flex: 0 0 9%;">
    <span class="no-select">{musicinfo.interval || '--/--'}</span>
  </div>
</div>

<style lang="less">
  .container {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 100%;
    padding: 5px;
    gap: 10px;
    position: relative;
    transition: 0.3s ease;
    background-color: transparent;
    border-radius: @radius-border;
    font-size: 13px;
    border: 1px dashed transparent;
    transition-property: color, background-color, opacity, border-color;
    // &:hover {
    //   .num {
    //     opacity: 0.6;
    //   }
    // }

    &:not(.active, .selected) {
      &:hover {
        background-color: var(--color-primary-background-hover);
      }
    }
    &.selected {
      background-color: var(--color-primary-background-selected);
    }
    &.active {
      background-color: var(--color-primary-background-active);
    }
    &.selectedactive {
      border-color: var(--color-primary-alpha-700);
    }
  }
  // .active {
  //   background-color: var(--color-primary-background);
  // }

  .pic {
    flex: none;
    position: relative;
    // background-color: var(--color-primary-light-200-alpha-900);
    // display: flex;
    // align-items: center;
    // justify-content: center;
    border-radius: @radius-border;
    overflow: hidden;
    // user-select: none;
    // flex: none;
    // > span {
    //   // width: 100%;
    //   // height: 80%;
    //   color: var(--color-primary-light-400-alpha-200);
    //   font-size: 18px;
    //   font-family: Consolas, 'Courier New', monospace;
    //   span {
    //     padding-left: 2px;
    //   }
    // }
    :global(.pic) {
      transition: opacity @transition-normal;
    }
  }
  // .num {
  //   position: absolute;
  //   bottom: 0;
  //   right: 0;
  //   .nobreak;
  //   .center;
  //   opacity: 0;
  //   transition: opacity .2s ease;
  //   padding-left: 2px;
  //   padding-right: 2px;
  //   font-size: 11px;
  //   line-height: 1.2;
  //   color: var(--color-button-font);
  //   background-color: var(--color-button-background);
  //   border-top-left-radius: @radius-border;
  //   border-bottom-right-radius: @radius-border;
  // }
  .play-icon {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    color: var(--color-button-font);
    padding: 6px;

    + :global(.pic) {
      opacity: 0.1;
    }
  }

  // .right {
  //   flex: auto;
  //   display: flex;
  //   flex-flow: row nowrap;
  //   font-size: 14px;
  //   gap: 2px;
  //   min-width: 0;
  //   span {
  //     .mixin-ellipsis-1();
  //   }
  // }

  .list-item-cell {
    flex: none;
    // padding: 0 6px;
    position: relative;
    // transition:  0.3s cubic-bezier(0.4, 0, 0.2, 1);
    line-height: 16px;
    vertical-align: middle;
    .mixin-ellipsis-1();

    &.auto {
      flex: auto;
    }

    &.name {
      display: flex;
      flex-flow: row nowrap;
      overflow: hidden;
      white-space: initial;
      text-overflow: initial;
      align-items: center;

      > .name {
        .mixin-ellipsis-1();
      }
    }
    // .badge {
    //   margin-left: 3px;
    //   opacity: 0.85;
    // }

    // &.meta {
    //   font-size: 12px;
    //   color: var(--color-font-label);
    // }
  }
</style>
