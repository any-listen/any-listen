<script lang="ts" module>
  export type MenuItem<T extends string = string> = Readonly<{ action: T; label: string; disabled?: boolean }>
  export type MenuList<T extends string = string> = Readonly<Array<MenuItem<T> | null>>
  export interface Position {
    x: number
    y: number
  }
</script>

<script lang="ts">
  import { menuLocaltion } from '@/shared/compositions/menuLocaltion'
  import Portal from './Portal.svelte'
  import { tick } from 'svelte'

  type _Menus = MenuList
  let render = $state(false)
  let anim = $state(false)

  // let domMenu: HTMLDivElement

  let {
    visible = $bindable(false),
    location = { x: 0, y: 0 },
    menus = [],
    onhide,
    onclick,
  }: {
    visible: boolean
    location: Position
    menus: _Menus
    onhide?: () => void
    onclick?: (val: NonNullable<_Menus[number]>) => void
  } = $props()

  const onHide = () => {
    visible = false
    onhide?.()
  }
  const menuClick = (item: NonNullable<_Menus[number]>) => {
    if (item.disabled) return
    onclick?.(item)
  }

  // let prevFocusedNode: HTMLElement | null = null
  $effect(() => {
    if (visible) {
      render = true
      void tick().then(() => {
        // prevFocusedNode = document.activeElement as HTMLElement
        anim = true
      })
      return
    }
    anim = false
    // prevFocusedNode?.focus()
  })
</script>

{#if render}
  <Portal to="#root">
    <div
      use:menuLocaltion={{ visible: anim, location, onHide }}
      class="menu"
      role="toolbar"
      tabindex="-1"
      aria-hidden={!anim}
      onclick={onHide}
      ontransitionend={(event) => {
        if (!visible) render = false
      }}
    >
      {#each menus as item, idx (item?.action ?? idx)}
        {#if item}
          <button
            class="menuItem"
            disabled={item.disabled}
            tabindex="0"
            aria-label={item.label}
            data-ignore-tip
            onclick={() => {
              menuClick(item)
            }}
          >
            {item.label}
          </button>
        {:else}
          <span class="hr"></span>
        {/if}
      {/each}
    </div>
  </Portal>
{/if}

<style lang="less">
  .menu {
    font-size: 12px;
    position: absolute;
    opacity: 0;
    transform: scale(0);
    transform-origin: 0 0 0;
    transition: 0.14s ease;
    transition-property: transform, opacity;
    border-radius: @radius-border;
    background-color: var(--color-content-background);
    box-shadow: @shadow-popup;
    z-index: 10;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
    outline: none;
    // padding: 3px 0;
    // will-change: transform;
    // border: 1px solid rgba(0, 0, 0, 0.1);
    // backdrop-filter: blur(4px);
    // &::before {
    //   display: block;
    //   position: absolute;
    //   content: '';
    //   inset: 0;
    //   z-index: -1;
    //   background-color: var(--color-content-background);
    //   opacity: 0.7;
    // }
  }
  .menuItem {
    cursor: pointer;
    display: block;
    min-width: 140px;
    line-height: 34px;
    // color: var(--color-button-font);
    padding: 0 15px;
    text-align: left;
    // outline: none;
    transition: @transition-normal;
    transition-property: background-color, opacity;
    .mixin-ellipsis-1();
    background-color: transparent;
    border: none;

    &:hover {
      background-color: var(--color-primary-background-hover);
    }
    &:active {
      background-color: var(--color-primary-background-active);
    }

    &[disabled] {
      cursor: default;
      opacity: 0.4;
      &:hover {
        background: none !important;
      }
    }
  }
  .hr {
    // margin: 5px 0;
    height: 1px;
    background-color: var(--color-primary-background-active);
  }
</style>
