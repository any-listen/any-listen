<script lang="ts">
  import Portal from '@/components/base/Portal.svelte'
  import { appState } from '@/modules/app/store/state'
  import { onDomSizeChanged } from '@any-listen/web'
  import { type Snippet, tick } from 'svelte'
  import type { MouseEventHandler, TransitionEventHandler } from 'svelte/elements'

  let {
    visible = $bindable(),
    height,
    maxheight,
    btnel,
    children,
    onmouseenter,
    onmouseleave,
    ontransitionend,
  }: {
    visible: boolean
    height?: string
    maxheight?: number
    btnel: HTMLElement | null
    children: Snippet
    onmouseenter: MouseEventHandler<HTMLDivElement>
    onmouseleave: MouseEventHandler<HTMLDivElement>
    ontransitionend?: TransitionEventHandler<HTMLDivElement>
  } = $props()

  let domContent = $state<HTMLDivElement | null>(null)
  let isShowTop = $state(false)
  let render = $state(false)
  let anim = $state(false)
  let popupStyle = $state('max-height: none; top: 0px; left: 0px; --arrow-left: 0px;')

  const arrowHeight = 9
  const arrowWidth = 8
  const sidePadding = 50
  const popupStyleObj = {
    maxHeight: 'none' as string | number,
    top: 0,
    left: 0,
    height: 'auto',
    '--arrow-left': 0,
  }
  const updateStyle = () => {
    popupStyle = `max-height: ${popupStyleObj.maxHeight}px; height: ${height}; top: ${popupStyleObj.top}px; left: ${popupStyleObj.left}px; --arrow-left: ${popupStyleObj['--arrow-left']}px;`
  }

  const cmpStyle = () => {
    const rect = btnel!.getBoundingClientRect()
    const maxHeight = document.body.clientHeight
    const elTop = rect.top - appState.rootOffsetY
    const bottomTopVal = elTop + rect.height
    const contentHeight = domContent!.scrollHeight + arrowHeight + sidePadding
    if (bottomTopVal + contentHeight < maxHeight || (contentHeight > elTop && elTop <= maxHeight - bottomTopVal)) {
      isShowTop = false
      popupStyleObj.top = bottomTopVal + arrowHeight
      popupStyleObj.maxHeight = maxHeight - bottomTopVal - arrowHeight - sidePadding
    } else {
      isShowTop = true
      let maxContentHeight = elTop - arrowHeight - sidePadding
      popupStyleObj.top = elTop - (elTop < contentHeight ? elTop : contentHeight) + sidePadding
      popupStyleObj.maxHeight = maxContentHeight
    }
    if (maxheight && maxheight < popupStyleObj.maxHeight) {
      popupStyleObj.maxHeight = maxheight
    }
    if (height) popupStyleObj.height = height

    const maxWidth = document.body.clientWidth - 20
    let center = domContent!.clientWidth / 2
    let left = rect.left + rect.width / 2 - appState.rootOffsetX - center
    if (left < sidePadding) {
      center -= sidePadding - left
      left = sidePadding
    } else if (left + domContent!.clientWidth > maxWidth) {
      let newLeft = maxWidth - domContent!.clientWidth
      center = center + left - newLeft
      left = newLeft
    }
    popupStyleObj.left = left
    popupStyleObj['--arrow-left'] = center - arrowWidth
    updateStyle()
  }
  const handleTransitionEnd: TransitionEventHandler<HTMLDivElement> = (event) => {
    if (!visible) render = false
    ontransitionend?.(event)
  }
  // $effect(() => {
  //   if (!visible || !domContent || !btnel) return
  //   cmpStyle()
  // })

  let prevFocusedNode: HTMLElement | null = null
  let isInited = false
  $effect(() => {
    if (visible) {
      render = true
      let unsub: (() => void) | null = null
      void tick().then(() => {
        // cmpStyle()
        anim = true
        prevFocusedNode = document.activeElement as HTMLElement
        if (isInited) domContent!.focus()
        unsub = onDomSizeChanged(domContent!, () => {
          cmpStyle()
          if (!isInited) {
            setTimeout(() => {
              domContent!.focus()
            }, 100)
            isInited = true
          }
        })
      })
      return () => {
        unsub?.()
      }
    }
    anim = false
    prevFocusedNode?.focus()
  })
</script>

{#if render}
  <Portal to="#root">
    <div
      class={['popup', { top: isShowTop, active: anim }]}
      style={popupStyle}
      aria-hidden={!anim}
      onclick={(e) => {
        e.stopPropagation()
      }}
      {onmouseenter}
      {onmouseleave}
      ontransitionend={handleTransitionEnd}
    >
      <div bind:this={domContent} class="popup-content" tabindex="-1">
        {@render children()}
      </div>
    </div>
  </Portal>
{/if}

<style lang="less">
  .popup {
    position: absolute;
    // top: -100%;
    // width: 645px;
    // left: 8px;
    // margin-top: 12px;
    max-width: 98%;
    border-radius: 4px;
    background-color: var(--color-content-background);
    opacity: 0;
    transform: scale(0.8);
    transform-origin: 50% 0 0;
    transition: 0.16s ease;
    transition-property: transform, opacity;
    max-height: 250px;
    z-index: 10;
    pointer-events: none;
    filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.12));
    display: flex;

    &:before {
      content: ' ';
      position: absolute;
      top: -6px;
      left: var(--arrow-left);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid var(--color-content-background);
    }

    &.active {
      opacity: 1;
      transform: scale(1);
      pointer-events: initial;
    }

    &.top {
      filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.12));
      transform-origin: 50% 100% 0;

      &:before {
        top: 100%;
        border-bottom: none;
        border-top: 8px solid var(--color-content-background);
      }
    }
  }
  .popup-content {
    padding: 10px;
    outline: none;
    min-height: 0;
    // box-shadow: 0 0 4px rgba(0, 0, 0, .2);
  }
</style>
