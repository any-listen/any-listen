<script lang="ts" module>
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const modalCounts = new Map<Element, number>()
</script>

<script lang="ts">
  import { fly } from 'svelte/transition'
  import Portal from '@/components/base/Portal.svelte'
  import { t } from '@/plugins/i18n'
  import { type Snippet, onMount, tick } from 'svelte'
  import { MODAL_CLASSNAMES } from '@/shared/constants'
  import { domClick } from '@/shared/compositions/click.svelte'
  import { windowDarg } from '@/shared/browser/widnow.svelte'
  let {
    visible = $bindable(),
    closebtn = true,
    bgclose = true,
    keyclose = true,
    teleport = '#root',
    maxwidth = '76%',
    minwidth = '320px',
    maxheight = '76%',
    minheight,
    width = 'auto',
    height = 'auto',
    title,
    onafterleave,
    onclose,
    children,
  }: {
    visible: boolean
    closebtn?: boolean
    bgclose?: boolean
    keyclose?: boolean
    teleport?: string | HTMLElement
    maxwidth?: string
    minwidth?: string
    maxheight?: string
    width?: string
    height?: string
    title?: string
    minheight?: string
    onclose?: (() => void) | (() => boolean | undefined | Promise<boolean | undefined>)
    onafterleave?: () => void
    children: Snippet
  } = $props()

  // let showContent = $state(visible)
  let domContainer: HTMLElement | null = $state(null)
  let headerEl: HTMLElement | null = $state(null)

  let contentStyle = $derived(
    `max-width: ${maxwidth}; min-width: ${minwidth}; max-height: ${maxheight}; width: ${width}; height: ${height};`
  )

  const close = async () => {
    const result = onclose?.()
    if (result === false || (result instanceof Promise && (await result) === false)) return
    visible = false
  }
  let parentNode: HTMLElement | null = null
  let prevFocusedNode: HTMLElement | null = null
  const handleShowChange = async (val: boolean) => {
    // console.log(val)
    if (val) {
      await tick()
      if (!domContainer) return
      parentNode = domContainer.parentNode as HTMLElement
      let modalCount = (modalCounts.get(parentNode) || 0) + 1
      modalCounts.set(parentNode, modalCount)
      if (modalCount == 1) parentNode.classList.add(MODAL_CLASSNAMES.modal)
      prevFocusedNode = document.activeElement as HTMLElement
      ;(domContainer.querySelector('.content') as HTMLDivElement).focus()
      // showContent = true
    } else {
      let modalCount = (modalCounts.get(parentNode!) || 0) - 1
      if (modalCount <= 0) {
        parentNode?.classList.remove(MODAL_CLASSNAMES.modal)
        modalCounts.delete(parentNode!)
      } else modalCounts.set(parentNode!, modalCount)
      prevFocusedNode?.focus()
      // showContent = false
    }
  }
  const handleAfterLeave = () => {
    onafterleave?.()
  }

  let preVisible = visible
  $effect(() => {
    if (preVisible == visible) return
    preVisible = visible
    void handleShowChange(preVisible)
  })
  onMount(() => {
    return () => {
      if (preVisible) {
        void handleShowChange(false)
      }
    }
  })
</script>

{#snippet header()}
  {#if title}
    <h3>{title}</h3>
  {/if}
  <span class="space"></span>
  {#if closebtn}
    <button class="no-drag" type="button" onclick={close} aria-label={$t('btn_close')}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 212.982 212.982">
        <use xlink:href="#icon-delete" />
      </svg>
    </button>
  {/if}
{/snippet}

<Portal to={teleport}>
  {#if visible}
    <div
      role="presentation"
      bind:this={domContainer}
      class="modal"
      transition:fly={{ y: -30 }}
      class:filter={teleport == '#root'}
      {@attach domClick(() => {
        if (bgclose) void close()
      })}
      onoutroend={handleAfterLeave}
      onoutrostart={import.meta.env.VITE_IS_DESKTOP
        ? () => {
            headerEl?.classList.remove('drag')
          }
        : undefined}
      onintroend={import.meta.env.VITE_IS_DESKTOP
        ? () => {
            headerEl?.classList.add('drag')
          }
        : undefined}
    >
      <div
        role="presentation"
        class="content"
        tabindex="-1"
        style={contentStyle}
        style:min-height={minheight}
        onclick={(e) => {
          e.stopPropagation()
        }}
        onkeydown={(e) => {
          if (e.key == 'Escape' && (e.target as HTMLElement)?.tagName != 'INPUT' && keyclose) {
            void close()
          }
        }}
      >
        {#if import.meta.env.VITE_IS_DESKTOP}
          <header class="header" bind:this={headerEl}>
            {@render header()}
          </header>
        {/if}
        {#if import.meta.env.VITE_IS_WEB}
          <header class="header" {@attach windowDarg}>
            {@render header()}
          </header>
        {/if}
        {@render children()}
      </div>
    </div>
  {/if}
</Portal>

<style lang="less">
  .modal {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    // background-color: rgba(0, 0, 0, .2);
    // background-color: rgba(255, 255, 255, .6);
    // background-color: var(--color-primary-light-600-alpha-900);
    // backdrop-filter: blur(4px);
    // backdrop-filter: grayscale(70%);
    display: grid;
    place-items: center center;
    width: 100%;
    height: 100%;
    // will-change: transform;
    contain: strict;

    &.filter {
      backdrop-filter: grayscale(40%);
    }

    // &:before {
    //   .mixin-after();
    //   position: absolute;
    //   left: 0;
    //   top: 0;
    //   width: 100%;
    //   height: 100%;
    //   background-color: var(--color-000);
    //   opacity: .6;
    // }
  }

  .content {
    position: relative;
    z-index: 100;
    display: flex;
    flex-flow: column nowrap;
    // max-height: 80%;
    // max-width: 76%;
    // width: var(--width, auto);
    // height: var(--height, auto);
    // max-height: var(--max-height, 76%);
    // max-width: var(--max-width, 76%);
    // min-width: var(--min-width, 280px);
    min-height: 250px;
    overflow: hidden;
    outline: none;
    background-color: var(--color-content-background);
    border-radius: 4px;
    box-shadow: 0 0 4px rgb(0 0 0 / 25%);
  }

  .header {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    height: 18px;
    background-color: var(--color-primary-light-100-alpha-400);

    h3 {
      padding: 0 4px;
      font-size: 12px;
      color: var(--color-primary-dark-500-alpha-600);
    }

    .space {
      flex: auto;
    }

    button {
      height: 100%;
      padding: 0 7px;
      line-height: 0;
      color: var(--color-primary-dark-500-alpha-500);
      cursor: pointer;
      background-color: transparent;
      border: none;
      // outline: none;
      transition: background-color 0.2s ease;

      svg {
        height: 0.7em;
      }

      &:hover {
        background-color: var(--color-primary-dark-100-alpha-600);
      }
      &:active {
        background-color: var(--color-primary-dark-200-alpha-600);
      }
    }
  }
</style>
