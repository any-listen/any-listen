<script lang="ts" module>
  export interface DropdownMenuItem {
    key: string
    label: string
    icon?: string
    disabled?: boolean
    onclick?: (item: DropdownMenuItem) => void
  }
  // null 表示分隔线
  export type DropdownMenu = ReadonlyArray<DropdownMenuItem | null>
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import PopupBtn from './PopupBtn.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'

  const {
    trigger,
    menu = [],
    autoshow = true,
    'aria-label': arialabel,
    onvisible,
  }: {
    trigger: Snippet
    menu?: DropdownMenu
    autoshow?: boolean
    'aria-label': string
    onvisible?: (visible: boolean) => void
  } = $props()

  let popup: ReturnType<typeof PopupBtn> | undefined = $state()

  const handleClick = (item: DropdownMenuItem) => {
    popup?.hide()
    item.onclick?.(item)
  }
</script>

<PopupBtn bind:this={popup} btncls {autoshow} aria-label={arialabel} {onvisible}>
  {@render trigger()}
  {#snippet content()}
    <div class="menu" role="menu">
      {#each menu as item, idx (item?.key ?? `hr_${idx}`)}
        {#if item}
          <button
            class="menu-item"
            role="menuitem"
            disabled={item.disabled}
            aria-label={item.label}
            data-ignore-tip
            onclick={() => {
              handleClick(item)
            }}
          >
            {#if item.icon}
              <SvgIcon name={item.icon} />
            {:else}
              <span class="icon-placeholder"></span>
            {/if}
            <span class="label">{item.label}</span>
          </button>
        {:else}
          <span class="hr" role="separator"></span>
        {/if}
      {/each}
    </div>
  {/snippet}
</PopupBtn>

<style lang="less">
  .menu {
    display: flex;
    flex-flow: column nowrap;
    // gap: 4px;
    min-width: 120px;
    margin: -4px;
    font-size: 13px;
  }
  .menu-item {
    display: flex;
    flex-flow: row nowrap;
    gap: 4px;
    align-items: center;
    padding: 8px;
    text-align: left;
    cursor: pointer;
    background-color: transparent;
    border: none;
    border-radius: @radius-border;
    transition: @transition-normal;
    transition-property: background-color, opacity;

    :global(svg) {
      flex: none;
      width: 1.2em;
      height: 1.2em;
    }

    .icon-placeholder {
      flex: none;
      width: 1.2em;
      height: 1.2em;
    }

    .label {
      .mixin-ellipsis-1();
    }

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
    margin: 4px 0;
    border-top: 1px solid var(--color-primary-background-active);
  }
</style>
