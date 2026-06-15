<script lang="ts">
  import { isShowPlayDetail } from '@/modules/playDetail/reactive.svelte'
  import { fly } from 'svelte/transition'
  import Header from './Header.svelte'
  import Main from './Main.svelte'
  import { useHidePlayDtail } from './shared/useHidePlayDtail'
  import Footer from './Footer/index.svelte'
  import { playDetailState } from '@/modules/playDetail/store/state'
  import { playerEvent } from '@/modules/player/store/event'
  import { playerState } from '@/modules/player/store/state'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { tick, untrack } from 'svelte'
  import { MODAL_CLASSNAMES } from '@/shared/constants'
  import { buildUrl, checkPicUrl } from '@any-listen/web'
  import { settingState } from '@/modules/setting/store/state'
  let introend = $state(playDetailState.isShowPlayDetail)
  let bgSrc = $state<string>()
  const isDynamicBackground = useSettingValue('playDetail.isDynamicBackground')
  const hidePlayDtail = useHidePlayDtail()
  let domContainer: HTMLElement | null = $state(null)

  $effect(() => {
    if (!isDynamicBackground.val) {
      bgSrc = undefined
      return
    }
    const handlePic = (url?: string | null) => {
      if (url) {
        url = buildUrl(url, settingState.setting['network.proxyAllResources'])
        void checkPicUrl(url, settingState.setting['network.proxyAllResources']).then((vaild) => {
          if (vaild) {
            bgSrc = `url(${url})`
          } else {
            bgSrc = undefined
          }
        })
      } else {
        bgSrc = undefined
      }
    }
    handlePic(playerState.musicInfo.pic)
    return playerEvent.on('picUpdated', handlePic)
  })

  let parentNode: HTMLElement | null | undefined = null
  $effect(() => {
    if (!$isShowPlayDetail) {
      if (parentNode) {
        parentNode.classList.remove(MODAL_CLASSNAMES.fullscreenModal)
        parentNode = null
      }
      return
    }

    untrack(() => {
      void tick().then(() => {
        parentNode = domContainer?.parentElement
        if (!parentNode) return
        parentNode.classList.add(MODAL_CLASSNAMES.fullscreenModal)
      })
    })
  })
</script>

{#if $isShowPlayDetail}
  <div
    in:fly={{ x: '100%', opacity: 1, delay: 10 }}
    out:fly={{ y: '100%', opacity: 1, delay: 10 }}
    class="play-detail"
    class:dybg={bgSrc}
    role="alert"
    bind:this={domContainer}
    oncontextmenu={hidePlayDtail}
    onintroend={() => {
      introend = true
    }}
    onoutroend={() => {
      introend = false
    }}
  >
    <div class="bg" style:background-image={bgSrc}></div>
    <Header />
    <Main {introend} />
    <Footer {introend} />
  </div>
{/if}

<style lang="less">
  .play-detail {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    height: 100%;
    contain: strict;
    color: var(--color-font);
    background-color: var(--color-content-background);
    // overflow: hidden;
    border-radius: @radius-border;
    // border-left: 12px solid var(--color-primary-alpha-900);
    // will-change: transform;

    &.dybg {
      :global {
        * {
          text-shadow:
            0 0 2px var(--color-primary-light-100-alpha-900),
            0 0 3px var(--color-primary-light-100-alpha-900),
            0 0 4px var(--color-primary-dark-700-alpha-900);
        }
        svg {
          filter: drop-shadow(0 0 2px var(--color-primary-light-100-alpha-600))
            drop-shadow(0 0 4px var(--color-primary-light-100-alpha-700));
        }
        .progress {
          > .progress {
            box-shadow:
              0 0 2px var(--color-primary-light-200-alpha-800),
              0 0 4px var(--color-primary-light-200-alpha-800);
          }
        }
      }
      .bg {
        background-size: 125% 125%;
        &::before {
          background-color: var(--color-content-background);
          opacity: 0.7;
        }
        &::after {
          background-color: transparent;
          backdrop-filter: blur(30px);
        }
      }
    }
  }
  .bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: var(--background-image) var(--background-image-position) no-repeat;
    background-size: var(--background-image-size);
    // background-size: 110% 110%;
    // filter: blur(60px);
    opacity: 0.7;
    &::before {
      display: block;
      width: 100%;
      height: 100%;
      content: '';
      background-color: var(--color-app-background);
    }
    &::after {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      height: 100%;
      content: '';
      background-color: var(--color-main-background);
    }
  }
</style>
