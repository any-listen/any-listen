<script lang="ts" generics="T, K extends keyof T">
  import { tick } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'

  let {
    value = $bindable(),
    list,
    itemkey,
    itemname,
    onchange,
  }: {
    value: T[K]
    list: T[]
    itemkey: K
    itemname: keyof T
    onchange?: (val: T[K]) => void
  } = $props()

  let domBtn: HTMLButtonElement
  let domList: HTMLDivElement | undefined = $state()
  let visible = $state(false)
  let listStyle = $state('transform: scaleY(0) translateY(0);')
  let activeIndex = $derived.by(() => {
    if (value == null) return -1
    return list.findIndex((l) => l[itemkey] == value)
  })
  let label = $derived.by(() => {
    if (value == null) return ''
    // if (itemname == null) return value
    const item = list[activeIndex]
    if (!item) return ''
    return item[itemname] as string
  })
  const handleGetOffset = () => {
    const listHeight = domList!.clientHeight
    const domSelect = domList!.offsetParent as HTMLButtonElement
    const domContainer = domSelect.offsetParent as HTMLElement
    const containerHeight = domContainer.clientHeight
    if (containerHeight < listHeight) return 0
    const offsetHeight = domContainer.scrollTop + containerHeight - (domSelect.offsetTop + listHeight)
    if (offsetHeight > 0) return 0
    return offsetHeight - 5
  }
  const handleShow = async () => {
    visible = true
    await tick()
    listStyle = `transform: scaleY(1) translateY(${handleGetOffset()}px);`

    const activeItem = domList!.children[activeIndex] as HTMLLIElement
    if (activeItem) domList!.scrollTop = activeItem.offsetTop - domList!.clientHeight * 0.38
  }

  const handleHide: MouseEventHandler<Document> = (event) => {
    if (!visible) return
    // if (e && e.target.parentNode != this.$refs.domList && this.show) return this.show = false
    if (event && (event.target == domBtn || domBtn.contains(event.target as HTMLElement))) return
    listStyle = 'transform: scaleY(0) translateY(0);'
    setTimeout(() => {
      visible = false
    }, 50)
  }

  const handleClick = (item: T) => {
    if (item[itemkey] === value) return
    value = item[itemkey]
    onchange?.(value)
  }
</script>

<div class={['select', { active: visible }]}>
  <button bind:this={domBtn} class="button" onclick={handleShow}>
    <span class="label">{label}</span>
    <div class="icon">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 451.847 451.847">
        <use xlink:href="#icon-down" />
      </svg>
    </div>
  </button>
  {#if visible}
    <div bind:this={domList} class="list scroll" style={listStyle}>
      {#each list as item (item[itemkey])}
        <button
          class="listItem"
          class:active={item[itemkey] == value}
          aria-label={item[itemname] as string}
          onclick={() => {
            handleClick(item)
          }}
        >
          {itemname ? item[itemname] : item}
        </button>
      {/each}
    </div>
  {/if}
</div>
<svelte:document onclickcapture={handleHide} />

<style lang="less">
  @selection-height: 28px;

  .select {
    display: inline-block;
    font-size: 12px;
    position: relative;
    width: 300px;

    &.active {
      .button {
        background-color: var(--color-button-background);
      }
      .list {
        opacity: 1;
      }
      .icon {
        svg {
          transform: rotate(180deg);
        }
      }
    }
  }

  .button {
    background-color: var(--color-button-background);
    padding: 0 10px;
    transition: background-color @transition-normal;
    height: @selection-height;
    // line-height: 27px;
    line-height: 1.5;
    color: var(--color-button-font);
    border-radius: @form-radius;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: none;
    width: 100%;
    text-align: left;

    span {
      flex: auto;
      .mixin-ellipsis-1();
    }
    .icon {
      flex: none;
      margin-left: 7px;
      line-height: 0;
      svg {
        width: 1em;
        transition: transform 0.2s ease;
        transform: rotate(0);
      }
    }

    &:hover {
      background-color: var(--color-button-background-hover);
    }
    &:active {
      background-color: var(--color-button-background-active);
    }
  }

  .list {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--color-content-background);
    opacity: 0;
    transform: scaleY(0) translateY(0);
    transform-origin: 0 (@selection-height / 2) 0;
    transition: 0.25s ease;
    transition-property: transform, opacity;
    z-index: 10;
    border-radius: @form-radius;
    box-shadow: @shadow-popup;
    overflow: auto;
    max-height: 200px;
  }
  .listItem {
    cursor: pointer;
    padding: 0 10px;
    line-height: @selection-height;
    // color: var(--color-button-font);
    // outline: none;
    transition: background-color @transition-normal;
    background-color: transparent;
    .mixin-ellipsis-1();
    border: none;
    display: block;
    width: 100%;
    text-align: left;

    &:hover {
      background-color: var(--color-button-background-hover);
    }
    &:active {
      background-color: var(--color-button-background-active);
    }
    &.active {
      color: var(--color-button-font);
    }
  }
</style>
