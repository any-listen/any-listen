<script lang="ts">
  import { fly } from 'svelte/transition'
  import Portal from '@/components/base/Portal.svelte'
  import { t } from '@/plugins/i18n'
  import { type Snippet, onMount, tick } from 'svelte'
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

  let modalCount = $state(0)
  let filter = $derived(teleport == '#root' || modalCount > 1)
  let contentStyle = $derived(
    `max-width: ${maxwidth}; min-width: ${minwidth}; max-height: ${maxheight}; width: ${width}; height: ${height};`
  )
  let isAddedClass = false

  const close = async () => {
    const result = onclose?.()
    if (result === false || (result instanceof Promise && (await result) === false)) return
    visible = false
  }
  let parentNode: HTMLElement | null = null
  let prevFocusedNode: HTMLElement | null = null
  const removeClass = () => {
    if (!isAddedClass) return
    parentNode?.classList.remove('show-modal')
  }
  const handleShowChange = async (val: boolean) => {
    // console.log(val)
    if (val) {
      await tick()
      if (!domContainer) return
      modalCount++
      parentNode = domContainer.parentNode as HTMLElement
      if (!parentNode.classList.contains('show-modal')) {
        parentNode.classList.add('show-modal')
        isAddedClass = true
      }
      prevFocusedNode = document.activeElement as HTMLElement
      ;(domContainer.querySelector('.content') as HTMLDivElement).focus()
      // showContent = true
    } else {
      if (modalCount > 0) modalCount--
      removeClass()
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

<Portal to={teleport}>
  {#if visible}
    <div
      role="presentation"
      bind:this={domContainer}
      class="modal"
      transition:fly={{ y: -30 }}
      class:filter
      onclick={() => {
        if (bgclose) void close()
      }}
      onoutroend={handleAfterLeave}
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
        <header class="header">
          {#if title}
            <h3>{title}</h3>
          {/if}
          <span class="space"></span>
          {#if closebtn}
            <button type="button" onclick={close} aria-label={$t('btn_close')}>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 212.982 212.982">
                <use xlink:href="#icon-delete" />
              </svg>
            </button>
          {/if}
        </header>
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
    width: 100%;
    height: 100%;
    // background-color: rgba(0, 0, 0, .2);
    // background-color: rgba(255, 255, 255, .6);
    // background-color: var(--color-primary-light-600-alpha-900);
    // backdrop-filter: blur(4px);
    // backdrop-filter: grayscale(70%);
    display: grid;
    align-items: center;
    justify-items: center;
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
    border-radius: 4px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    // max-height: 80%;
    // max-width: 76%;
    // width: var(--width, auto);
    // height: var(--height, auto);
    // max-height: var(--max-height, 76%);
    // max-width: var(--max-width, 76%);
    // min-width: var(--min-width, 280px);
    min-height: 250px;
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    z-index: 100;
    background-color: var(--color-content-background);
    outline: none;
  }

  .header {
    flex: none;
    background-color: var(--color-primary-light-100-alpha-400);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 18px;

    h3 {
      font-size: 12px;
      padding: 0 4px;
      color: var(--color-primary-dark-500-alpha-600);
    }

    .space {
      flex: auto;
    }

    button {
      border: none;
      cursor: pointer;
      padding: 0 7px;
      height: 100%;
      background-color: transparent;
      color: var(--color-primary-dark-500-alpha-500);
      // outline: none;
      transition: background-color 0.2s ease;
      line-height: 0;

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
