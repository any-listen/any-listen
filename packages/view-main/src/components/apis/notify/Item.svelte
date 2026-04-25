<script lang="ts">
  import { fly } from 'svelte/transition'
  import { extensionList } from '@/modules/extension/reactive.svelte'
  import { extI18n } from '@/modules/extension/i18n'
  import type { NotifyItem } from './shared'
  import { onDestroy, onMount } from 'svelte'
  import { onSettingChanged } from '@/modules/setting/shared'
  import Btn from '@/components/base/Btn.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'

  let {
    item,
    offset = 0,
    maxheight,
    onhide,
    onmount,
  }: {
    offset?: number
    maxheight: string
    item: NotifyItem
    onhide: () => void
    onmount: (height: number) => void
  } = $props()

  let autoCloseTimer: number | null = null
  let domContent = $state<HTMLDivElement | null>(null)
  let extensionName = $derived.by(() => {
    if (!item.extId) return ''
    const ext = $extensionList.find((ext) => ext.id === item.extId)
    return ext ? extI18n.t(item.extId, ext.name) : ''
  })
  let transform = $derived(`translateX(-50%) translateY(${-offset}px)`)

  let hideTime = 0
  const addAutoCloseTimer = () => {
    clearAutoCloseTimer()
    autoCloseTimer = setTimeout(
      () => {
        autoCloseTimer = null
        onhide()
      },
      hideTime == 0 ? item.autoCloseTime * 1000 : hideTime
    )
  }
  const clearAutoCloseTimer = () => {
    if (!autoCloseTimer) return
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
    hideTime = 0
  }

  $effect(() => {
    const unsub = onSettingChanged('common.windowSizeId', () => {
      onmount(domContent?.clientHeight ?? 0)
    })
    return () => {
      unsub()
    }
  })
  onMount(() => {
    addAutoCloseTimer()
    hideTime = performance.now() + item.autoCloseTime * 1000
    onmount(domContent?.clientHeight ?? 0)
  })
  onDestroy(() => {
    clearAutoCloseTimer()
  })
</script>

<div
  class="notify-content"
  role="alert"
  bind:this={domContent}
  style:transform
  style:max-height={maxheight}
  transition:fly|global={{ y: 30 }}
  onoutroend={item.onafterleave}
  onmouseenter={() => {
    hideTime = Math.max(2000, hideTime - performance.now())
    clearAutoCloseTimer()
  }}
  onmouseleave={() => {
    addAutoCloseTimer()
  }}
>
  <div class="content scroll" class:select={item.selectText} style:max-height={`calc(${maxheight} - 1rem)`}>
    {#if extensionName}
      <span>[{extensionName}]</span>
    {/if}{item.message}
  </div>
  <Btn
    icon
    min
    link
    onclick={() => {
      clearAutoCloseTimer()
      onhide()
    }}
  >
    <SvgIcon name="multiply" />
  </Btn>
</div>

<style lang="less">
  .notify-content {
    position: absolute;
    bottom: 0;
    left: 50%;
    box-sizing: border-box;
    display: flex;
    flex-flow: row nowrap;
    gap: 5px;
    align-items: center;
    justify-content: space-between;
    min-width: 100px;
    max-width: 100%;
    padding: 8px 8px 8px 14px;
    overflow: hidden;
    font-size: 14px;
    // transform: scale(1);
    line-height: 1.2;
    color: var(--color-font);
    background: var(--color-content-background);
    border-radius: @radius-border;
    box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
    transform: translateX(-50%);
    transition: transform @transition-normal;

    .content {
      flex: auto;
      min-width: 0;
      padding: 0.04rem 0;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .select {
      user-select: text;
    }

    :global(.btn) {
      opacity: 0.4;
      &:hover {
        opacity: 1;
      }
    }

    span {
      margin-right: 5px;
      font-size: 12px;
      color: var(--color-primary-dark-500-alpha-300);
    }
  }

  // :global(.tips-fade-enter-active),
  // :global(.tips-fade-leave-active) {
  //   transition: opacity 0.2s;
  // }
  // :global(.tips-fade-enter),
  // :global(.tips-fade-leave-to) {
  //   opacity: 0;
  // }
</style>
