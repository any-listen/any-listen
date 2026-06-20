<script lang="ts">
  import { progress } from '@/modules/player/reactive.svelte'
  import { onActivePlayProgressTransition } from '@/modules/player/shared'
  import { playerState } from '@/modules/player/store/state'
  import { actions } from '@/shared/actions'
  import { onMount } from 'svelte'
  const msEvent = {
    isMsDown: false,
    msDownX: 0,
    msDownProgress: 0,
  }
  let domProgress: HTMLDivElement
  let dragging = $state(false)
  let isActiveTransition = $state(false)
  let dragProgress = $state(0)

  const handleDown = (clientX: number, offsetX: number) => {
    msEvent.isMsDown = true
    msEvent.msDownX = clientX

    let val = offsetX / domProgress.clientWidth
    if (val < 0) val = 0
    if (val > 1) val = 1

    msEvent.msDownProgress = val
    dragProgress = msEvent.msDownProgress
  }
  const handleMsUp = () => {
    if (msEvent.isMsDown) setProgress(dragProgress * playerState.progress.maxPlayTime)
    msEvent.isMsDown = false
    dragging = false
  }
  const handleMove = (clientX: number) => {
    dragging ||= true

    let progress = msEvent.msDownProgress + (clientX - msEvent.msDownX) / domProgress.clientWidth
    if (progress > 1) progress = 1
    else if (progress < 0) progress = 0
    dragProgress = progress
  }
  const handleMsMove = (event: MouseEvent) => {
    if (!msEvent.isMsDown) return
    handleMove(event.clientX)
  }
  const handleTouchMove = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      if (!msEvent.isMsDown) return
      event.preventDefault()
      const touch = event.changedTouches[0]
      handleMove(touch.clientX)
    }
  }
  const handleMsDown = (event: MouseEvent) => {
    handleDown(event.clientX, event.offsetX)
  }
  const handleTouchDown = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      event.preventDefault()
      const touch = event.changedTouches[0]
      let offsetX = touch.clientX - (event.currentTarget as HTMLDivElement).getBoundingClientRect().left
      handleDown(touch.clientX, offsetX)
    }
  }

  const handleTransitionend = () => {
    isActiveTransition = false
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMsMove)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('mouseup', handleMsUp)
    document.addEventListener('touchend', handleMsUp)
    const unsub = onActivePlayProgressTransition(() => {
      isActiveTransition = true
    })
    return () => {
      document.removeEventListener('mousemove', handleMsMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleMsUp)
      document.removeEventListener('touchend', handleMsUp)
      unsub()
    }
  })

  const setProgress = (num: number) => {
    actions.exec('player.seekTo', num)
  }
</script>

<div class="progress">
  <div
    class="progress-bar progress-bar2"
    class:bar-transition={isActiveTransition}
    style={`transform: scaleX(${$progress.progress || 0})`}
    ontransitionend={handleTransitionend}
  ></div>
  <div class:show={dragging} class="progress-bar progress-bar3" style={`transform: scaleX(${dragProgress || 0})`}></div>
</div>
<div
  role="slider"
  tabindex="0"
  aria-valuenow={$progress.progress}
  bind:this={domProgress}
  class="progress-mask"
  onmousedown={handleMsDown}
  ontouchstart={handleTouchDown}
></div>

<style lang="less">
  .progress {
    // background-color: #f5f5f5;
    position: relative;
    width: 100%;
    height: 5px;
    contain: strict;
    overflow: hidden;
    background-color: var(--color-primary-light-100-alpha-800);
    border-radius: 40px;
    transition: @transition-normal;
    transition-property: background-color;
  }
  .progress-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    contain: strict;
    cursor: pointer;
  }
  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: 0;
  }
  // .progress-bar1 {
  //   background-color: var(--color-primary-light-100-alpha-600);
  // }

  .progress-bar2 {
    background-color: var(--color-primary-light-100-alpha-400);
    will-change: transform;
  }

  .progress-bar3 {
    background-color: var(--color-primary-light-100-alpha-200);
    // box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: @transition-normal;
    transition-property: opacity;
    &.show {
      opacity: 0.5;
    }
  }

  .bar-transition {
    transition-timing-function: ease-out;
    transition-duration: 0.2s;
    transition-property: transform;
  }
</style>
