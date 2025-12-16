<script lang="ts">
  import Badge from '@/components/base/Badge.svelte'
  import Image from '@/components/base/Image.svelte'

  // import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { fade } from 'svelte/transition'
  import { buildSourceLabel } from '@any-listen/common/tools'
  import type { MouseEventHandler } from 'svelte/elements'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { t } from '@/plugins/i18n'
  import Btn from '@/components/base/Btn.svelte'
  import { scrollListTo } from '@/modules/app/store/action'
  import { onMount, tick } from 'svelte'
  import { getMusicPicDelay } from '@/modules/player/store/actions'
  // console.log(querystring)
  let {
    info,
    picstyle,
    // selected,
    // selectedactive,
    playing,
    oncontextmenu,
    onclick,
  }: {
    info: AnyListen.Player.PlayMusicInfo
    index: number
    picstyle: string
    playing: boolean
    // selected?: boolean
    // selectedactive?: boolean
    oncontextmenu?: MouseEventHandler<HTMLDivElement>
    onclick: (isKey: boolean) => void
  } = $props()

  let sourceLabel = $derived(buildSourceLabel(info.musicInfo))
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

  let cancelLoadPic: (() => void) | undefined = undefined
  let retryedLoadPic = false
  const loadPic = () => {
    cancelLoadPic?.()
    cancelLoadPic = getMusicPicDelay({ musicInfo: info.musicInfo, listId: info.listId, isRefresh: retryedLoadPic }, (url) => {
      cancelLoadPic = undefined
      void tick().then(() => {
        picUrl = url
      })
    })
  }

  onMount(() => {
    retryedLoadPic = false
    loadPic()
    return () => {
      cancelLoadPic?.()
    }
  })
</script>

<div
  class="container"
  class:played={info.played}
  role="button"
  tabindex="0"
  onkeydown={handleClick}
  onclick={handleClick}
  {oncontextmenu}
>
  <div class="pic" style={picstyle}>
    {#if playing}
      <div class="play-icon" transition:fade={{ delay: 200 }}>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <use xlink:href="#icon-play" />
        </svg>
      </div>
    {/if}
    <Image
      src={picUrl}
      onerror={() => {
        if (retryedLoadPic) return
        retryedLoadPic = true
        loadPic()
      }}
    />
  </div>
  <div class="name-info">
    <div class="name" aria-label={info.musicInfo.name}>
      <h4>{info.musicInfo.name}</h4>
      {#if sourceLabel}
        <Badge label={sourceLabel} opacity={0.7} />
      {/if}
    </div>
    <div class="singer">
      {#if info.musicInfo.singer}
        <span aria-label={info.musicInfo.singer}>{info.musicInfo.singer}</span>
      {/if}
      {#if info.musicInfo.meta.albumName}
        <span aria-label={info.musicInfo.meta.albumName}>{info.musicInfo.meta.albumName}</span>
      {/if}
    </div>
  </div>
  {#if info.playLater}
    <div class="play-later" style="flex: 0 0 8%;" aria-label={$t('user_list_music_menu__play_later')}>
      <SvgIcon name="step-into" />
    </div>
  {/if}
  <div class="goto" style="flex: 0 0 9%;">
    <Btn
      outline
      icon
      onclick={() => {
        scrollListTo(info.listId, info.isOnline, info.musicInfo.id)
      }}
    >
      <SvgIcon name="visit" />
    </Btn>
  </div>
  <div class="time" style="flex: 0 0 9%;">
    <span class="no-select">{info.musicInfo.interval || '--/--'}</span>
  </div>
</div>

<style lang="less">
  .container {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: 10px;
    align-items: center;
    height: 100%;
    padding: 5px;
    font-size: 13px;
    background-color: transparent;
    border: 1px dashed transparent;
    border-radius: @radius-border;
    transition: 0.3s ease;
    transition-property: background-color, opacity;
    // &:hover {
    //   .num {
    //     opacity: 0.6;
    //   }
    // }

    &.played {
      opacity: 0.4;
    }

    &:not(.active, .selected) {
      &:hover {
        background-color: var(--color-primary-background-hover);
      }
    }
    &:hover {
      .goto {
        opacity: 1;
      }
    }
    // &.selected {
    //   background-color: var(--color-primary-background-selected);
    // }
    // &.active {
    //   background-color: var(--color-primary-background-active);
    // }
    // &.selectedactive {
    //   border-color: var(--color-primary-alpha-700);
    // }
  }
  // .active {
  //   background-color: var(--color-primary-background);
  // }

  .pic {
    position: relative;
    flex: none;
    // background-color: var(--color-primary-light-200-alpha-900);
    // display: flex;
    // align-items: center;
    // justify-content: center;
    border-radius: @radius-border;
    // overflow: hidden;
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
      transition: opacity @transition-fast;
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 6px;
    color: var(--color-button-font);

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

  .name-info {
    flex: auto;
    min-width: 0;
    .name {
      display: flex;
      flex-flow: row nowrap;
      gap: 5px;
      align-items: center;
      .auto-hidden();
    }
    h4 {
      .auto-hidden();
    }
    .singer {
      display: flex;
      flex-flow: row nowrap;
      font-size: 12px;
      color: var(--color-font-label);

      span {
        .auto-hidden();
        + span {
          &::before {
            display: inline-block;
            padding: 0 3px;
            color: var(--color-primary-font);
            content: '•';
            opacity: 0.4;
          }
        }
      }
    }
  }

  .play-later {
    flex: none;
    font-size: 20px;
    color: var(--color-primary-font);
    text-align: center;
  }

  .goto {
    opacity: 0;
    transition: opacity @transition-fast;
  }

  .time {
    flex: none;
    color: var(--color-font-label);
  }

  // .list-item-cell {
  //   flex: none;
  //   // padding: 0 6px;
  //   position: relative;
  //   // transition:  0.3s cubic-bezier(0.4, 0, 0.2, 1);
  //   line-height: 16px;
  //   vertical-align: middle;
  //   box-sizing: border-box;
  //   .mixin-ellipsis-1();

  //   &.auto {
  //     flex: auto;
  //   }

  //   &.name {
  //     display: flex;
  //     flex-flow: row nowrap;
  //     overflow: hidden;
  //     white-space: initial;
  //     text-overflow: initial;
  //     align-items: center;

  //     > .name {
  //       .mixin-ellipsis-1();
  //     }
  //   }
  //   // .badge {
  //   //   margin-left: 3px;
  //   //   opacity: 0.85;
  //   // }

  //   // &.meta {
  //   //   font-size: 12px;
  //   //   color: var(--color-font-label);
  //   // }
  // }
</style>
