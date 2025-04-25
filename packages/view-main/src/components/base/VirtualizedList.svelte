<script lang="ts" generics="T extends object">
  import { type Snippet, tick } from 'svelte'
  import { debounce, handleScroll } from './utils'
  import type { MouseEventHandler } from 'svelte/elements'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar'

  let {
    row,
    footer,
    listel = 'ul',
    containerclass,
    listitemel = 'li',
    contentclass,
    itemheight,
    keyname,
    list,
    scrollbaroffset = '0',
    scrollbarwidth = '0.5rem',
    contain = 'strict',
    onscroll: _onscroll,
    oncontextmenu,
  }: {
    row: Snippet<[T, number]>
    footer?: Snippet
    listel?: string
    containerclass?: string
    listitemel?: string
    contentclass?: string
    scrollbaroffset?: string
    scrollbarwidth?: string
    contain?: string
    itemheight: number
    keyname: string
    list: T[]
    onscroll?: (pos: number) => void
    oncontextmenu?: MouseEventHandler<HTMLDivElement>
  } = $props()

  interface ListItem {
    item: T
    top: number
    style: string
    index: number
    key: string
  }
  let views = $state.raw<ListItem[]>([])
  let domScrollContainer: HTMLElement
  let isListScrolling = $state(false)
  let startIndex = -1
  let endIndex = -1
  let scrollTop = -1
  let cachedList: ListItem[] = []
  let cancelScroll: null | (() => void) = null
  let isAutoScrolling = false
  let scrollToValue = 0

  const createList = (startIndex: number, endIndex: number) => {
    const cache = cachedList.slice(startIndex, endIndex)
    return list.slice(startIndex, endIndex).map((item, i) => {
      if (cache[i]) return cache[i]
      const top = (startIndex + i) * itemheight
      const index = startIndex + i
      return (cachedList[index] = {
        item,
        top,
        style: `position:absolute; left:0; right:0; top:${top}px; height:${itemheight}px;`,
        index,
        key: item[keyname as keyof T] as string,
      })
    })
  }

  const updateView = (currentScrollTop = domScrollContainer.scrollTop) => {
    // const currentScrollTop = this.$refs.domScrollContainer.scrollTop
    const currentStartIndex = Math.floor(currentScrollTop / itemheight)
    const scrollContainerHeight = domScrollContainer.clientHeight
    const currentEndIndex = currentStartIndex + Math.ceil(scrollContainerHeight / itemheight)
    const continuous = currentStartIndex <= endIndex && currentEndIndex >= startIndex
    const currentStartRenderIndex = Math.max(currentStartIndex - 1, 0)
    const currentEndRenderIndex = currentEndIndex + 1
    // console.log(continuous)
    // debugger
    if (continuous) {
      // if (Math.abs(currentScrollTop - this.scrollTop) < this.itemHeight * 0.6) return
      // console.log('update')
      // if (currentScrollTop > scrollTop) { // scroll down
      //   // console.log('scroll down')
      //   views.value = createList(currentStartRenderIndex, currentEndRenderIndex)
      //   // views.value.push(...list.slice(list.indexOf(views.value[views.value.length - 1]) + 1))
      //   // // if (this.views.length > 100) {
      //   // nextTick(() => {
      //   //   views.value.splice(0, views.value.indexOf(list[0]))
      //   // })
      //   // }
      // } else if (currentScrollTop < scrollTop) { // scroll up
      //   // console.log('scroll up')
      //   views.value = createList(currentStartRenderIndex, currentEndRenderIndex)
      // } else return
      if (currentScrollTop == scrollTop && endIndex >= currentEndIndex) return
      requestAnimationFrame(() => {
        views = createList(currentStartRenderIndex, currentEndRenderIndex)
      })
    } else {
      requestAnimationFrame(() => {
        views = createList(currentStartRenderIndex, currentEndRenderIndex)
      })
    }
    startIndex = currentStartIndex
    endIndex = currentEndIndex
    scrollTop = currentScrollTop
  }

  const setStopScrollStatus = debounce(() => {
    isListScrolling = false
  }, 200)
  const onScroll = () => {
    isListScrolling ||= true
    setStopScrollStatus()

    const currentScrollTop = domScrollContainer.scrollTop
    if (Math.abs(currentScrollTop - scrollTop) > itemheight * 0.6) {
      updateView(currentScrollTop)
    }
    _onscroll?.(currentScrollTop)
  }

  export const scrollTo = (scrollTop: number, animate = false, onScrollEnd?: (end: boolean) => void) => {
    if (onScrollEnd) {
      void new Promise<void>((resolve) => {
        if (cancelScroll) cancelScroll()
        resolve()
      }).then(() => {
        if (animate) {
          isAutoScrolling = true
          scrollToValue = scrollTop
          cancelScroll = handleScroll(
            domScrollContainer,
            scrollTop,
            300,
            () => {
              cancelScroll = null
              isAutoScrolling = false
              onScrollEnd(true)
            },
            () => {
              cancelScroll = null
              isAutoScrolling = false
              onScrollEnd(false)
            }
          )
        } else {
          domScrollContainer.scrollTop = scrollTop
          requestAnimationFrame(() => {
            onScrollEnd(true)
          })
        }
      })
    } else {
      domScrollContainer.scrollTo({
        top: scrollTop,
        behavior: animate ? 'smooth' : 'instant',
      })
    }
  }

  export const scrollToIndex = (index: number, offset = 0, animate = false, onScrollEnd?: (end: boolean) => void) => {
    scrollTo(Math.max(index * itemheight + offset, 0), animate, onScrollEnd)
  }

  export const getScrollTop = () => {
    return isAutoScrolling ? scrollToValue : domScrollContainer.scrollTop
  }

  export const getListEl = () => {
    return domScrollContainer
  }

  let contentStyle = $derived(
    `display: block; position: relative; height: ${list.length * itemheight}px; pointer-events: ${isListScrolling ? 'none' : 'auto'}`
  )

  const handleReset = (list: unknown[]) => {
    cachedList = Array(list.length)
    startIndex = -1
    endIndex = -1
    void tick().then(() => {
      updateView()
    })
  }
  const handleItemHeightChange = (...tracking: unknown[]) => {
    handleReset(list)
  }
  $effect.pre(() => {
    handleItemHeightChange(itemheight, list)
  })

  let timeout: number | null
  const handleResize = () => {
    if (timeout) clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      timeout = null
      updateView()
    }, 50)
  }
  $effect(() => {
    domScrollContainer.addEventListener('scroll', onScroll, false)
    cachedList = Array(list.length)
    startIndex = -1
    endIndex = -1
    updateView()
    window.addEventListener('resize', handleResize)
    return () => {
      domScrollContainer.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleResize)
      if (cancelScroll) cancelScroll()
    }
  })
</script>

<div
  bind:this={domScrollContainer}
  class={containerclass}
  use:verticalScrollbar={{ offset: scrollbaroffset, scrollbarWidth: scrollbarwidth }}
  tabindex="0"
  role="listbox"
  style="height: 100%; position: relative; overflow-y: auto; display: block;"
  style:contain
  {oncontextmenu}
>
  <svelte:element this={listel} class={contentclass} style={contentStyle}>
    {#each views as item (item.key)}
      <svelte:element this={listitemel} style={item.style} style:contain="strict">
        {@render row(item.item, item.index)}
      </svelte:element>
    {/each}
  </svelte:element>
  {#if footer}
    {@render footer()}
  {/if}
</div>
