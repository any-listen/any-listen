<script lang="ts" generics="T, K extends keyof T = keyof T">
  import { link } from '@/plugins/routes'
  import SvgIcon from './SvgIcon.svelte'

  let {
    list,
    tagname = 'button',
    align = 'left',
    disabled,
    itemkey,
    itemlabel,
    itemicon,
    min,
    value = $bindable(),
    onchange,
    href,
  }: {
    list: readonly T[]
    tagname?: 'a' | 'button'
    align?: 'left' | 'center' | 'right'
    min?: boolean
    disabled?: boolean
    itemkey: K
    itemlabel: keyof T
    itemicon?: keyof T
    value?: T[keyof T]
    href?: keyof T
    onchange?: (val: T) => void
  } = $props()

  const handleToggle = (item: T) => {
    if (item[itemkey] == value) return
    value = item[itemkey]
    onchange?.(item)
  }
</script>

<div class={['list', align]} class:disabled class:min role="tablist">
  {#if tagname == 'a' && href}
    {#each list as item (item[itemkey])}
      <a
        href={item[href] as string}
        class="list-item link"
        class:active={value == item[itemkey]}
        tabindex="0"
        role="tab"
        {@attach link()}
        aria-label={item[itemlabel] as string}
        data-ignore-tip
        aria-selected={value == item[itemkey]}
        onclick={(evt) => {
          handleToggle(item)
        }}
      >
        <span class="label">
          {#if itemicon}
            <SvgIcon name={item[itemicon] as string} />
          {/if}
          {item[itemlabel]}
        </span>
      </a>
    {/each}
  {:else}
    {#each list as item (item[itemkey])}
      <button
        class="list-item"
        class:active={value == item[itemkey]}
        tabindex="0"
        role="tab"
        aria-label={item[itemlabel] as string}
        data-ignore-tip
        aria-selected={value == item[itemkey]}
        onclick={() => {
          handleToggle(item)
        }}
      >
        <span class="label">
          {#if itemicon}
            <SvgIcon name={item[itemicon] as string} />
          {/if}
          {item[itemlabel]}
        </span>
      </button>
    {/each}
  {/if}
</div>

<style lang="less">
  .list {
    display: flex;
    flex-flow: row nowrap;
    gap: 24px;
    font-size: 12px;
    // padding: 0 15px;

    &:global(.left) {
      justify-content: flex-start;
    }
    &:global(.center) {
      justify-content: center;
    }
    &:global(.right) {
      justify-content: flex-end;
    }

    &.min {
      gap: 12px;
    }
    &.disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
  .list-item {
    display: block;
    padding: 0;
    // padding: 5px 15px;
    cursor: pointer;
    background-color: transparent;
    border: none;
    transition: color @transition-normal;

    &.link {
      text-decoration: none;
    }

    &:hover {
      color: var(--color-primary);
    }

    &.active {
      color: var(--color-primary);
      cursor: default;

      > .label {
        &::after {
          // background-color: var(--color-primary);
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }

  .label {
    position: relative;
    display: block;
    display: flex;
    flex-flow: row nowrap;
    gap: 4px;
    align-items: center;
    padding: 8px 1px;

    &::after {
      .mixin-after();

      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--color-primary-alpha-300);
      border-radius: 20px;
      opacity: 0;
      transform: translateY(-4px);
      transition: @transition-fast;
      transition-property: transform, opacity;
    }
  }
</style>
