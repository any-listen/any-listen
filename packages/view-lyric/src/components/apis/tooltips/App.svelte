<script lang="ts">
  import type { Position } from './shared'
  import { tick, untrack } from 'svelte'
  import { fade } from 'svelte/transition'

  let {
    onafterleave,
  }: {
    onafterleave?: () => void
  } = $props()

  let rawPosition = { x: 0, y: 0 }
  let position = $state.raw({ x: 0, y: 0 })
  let message = $state('')
  let visible = $state(false)
  let width = $state('auto')
  let transform = $state('translate(0, 0)')
  let style = $derived(`left:${position.x}px;top:${position.y}px;transform:${transform};max-width:80%;width:${width};`)
  let domTips = $state<HTMLDivElement>()
  let autoCloseTimer: null | number = null

  // const handleGetMaxWidth = (left: number) => {
  //   const containerWidth = document.documentElement.clientWidth
  //   let maxWidth = containerWidth - left
  //   return (maxWidth > left ? maxWidth : left - 12) - 30
  // }
  const handleGetOffsetXY = (left: number, top: number) => {
    // const maxWidth = handleGetMaxWidth(left)

    const tipsWidth = domTips!.clientWidth
    const tipsHeight = domTips!.clientHeight
    const domContainer = document.documentElement
    const containerWidth = domContainer.clientWidth
    const containerHeight = domContainer.clientHeight
    let x = 0
    let y = 0
    if (left + tipsWidth > containerWidth - 5) {
      x = containerWidth - left - tipsWidth - 6
    }
    if (top + tipsHeight > containerHeight - 5) {
      y = -tipsHeight - 14
    }
    return `${x}px, ${y}px`
  }
  const setPosition = () => {
    position = { x: 0, y: 0 }
    width = 'auto'
    transform = 'translate(0, 0)'
    void tick().then(() => {
      // maxWidth = `${handleGetMaxWidth(position.x)}px`
      // await tick()
      if (!domTips) return
      position = rawPosition
      width = window.getComputedStyle(domTips, null).width
      transform = `translate(${handleGetOffsetXY(rawPosition.x, rawPosition.y)})`
    })
  }

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    message
    untrack(setPosition)
  })

  let autoCloseTime = 0
  const addAutoCloseTimer = () => {
    clearAutoCloseTimer()
    autoCloseTimer = setTimeout(() => {
      autoCloseTimer = null
      visible = false
    }, autoCloseTime)
  }
  const clearAutoCloseTimer = () => {
    if (!autoCloseTimer) return
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  export const show = (_position: Position, _message: string, _autoCloseTime = 0) => {
    if ((rawPosition.x !== _position.x || rawPosition.y !== _position.y) && message === _message) {
      setPosition()
    }
    rawPosition = _position
    message = _message
    autoCloseTime = _autoCloseTime
    addAutoCloseTimer()
    visible ||= true
  }
  export const hide = () => {
    clearAutoCloseTimer()
    visible &&= false
  }
  export const setTips = (_message: string) => {
    message = _message
    addAutoCloseTimer()
  }
</script>

{#if visible}
  <div transition:fade={{ duration: 100 }} bind:this={domTips} {style} class="tips" role="presentation" onoutroend={onafterleave}>
    {message}
  </div>
{/if}

<style lang="less">
  .tips {
    position: fixed;
    z-index: 10001;
    box-sizing: border-box;
    padding: 4px 5px;
    overflow: hidden;
    font-size: 12px;
    // transform: scale(1);
    line-height: 1.2;
    // max-width: 80%;
    color: var(--color-font);
    word-wrap: break-word;
    white-space: pre-wrap;
    pointer-events: none;
    background: var(--color-content-background);
    border-radius: 3px;
    // text-align: justify;
    box-shadow: 0 1px 8px rgb(0 0 0 / 30%);
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
