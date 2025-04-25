<script lang="ts" generics="T">
  import { link } from '@/plugins/routes'

  let {
    list,
    tagname = 'button',
    align = 'left',
    itemkey,
    itemlabel,
    value = $bindable(),
    onchange,
    href,
  }: {
    list: readonly T[]
    tagname?: 'a' | 'button'
    align?: 'left' | 'center' | 'right'
    itemkey: keyof T
    itemlabel: keyof T
    value: T[keyof T]
    href?: keyof T
    onchange?: (val: T[keyof T]) => void
  } = $props()

  const handleToggle = (id: T[keyof T]) => {
    if (id == value) return
    value = id
    onchange?.(id)
  }
</script>

<div class={['list', align]} role="tablist">
  {#if tagname == 'a' && href}
    {#each list as item (item[itemkey])}
      <a
        href={item[href] as string}
        class="listItem link"
        class:active={value == item[itemkey]}
        tabindex="0"
        role="tab"
        use:link
        aria-label={item[itemlabel] as string}
        data-ignore-tip
        aria-selected={value == item[itemkey]}
        onclick={() => {
          handleToggle(item[itemkey])
        }}
      >
        <span class="label">{item[itemlabel]}</span>
      </a>
    {/each}
  {:else}
    {#each list as item (item[itemkey])}
      <button
        class="listItem"
        class:active={value == item[itemkey]}
        tabindex="0"
        role="tab"
        aria-label={item[itemlabel] as string}
        data-ignore-tip
        aria-selected={value == item[itemkey]}
        onclick={() => {
          handleToggle(item[itemkey])
        }}
      >
        <span class="label">{item[itemlabel]}</span>
      </button>
    {/each}
  {/if}
</div>

<style lang="less">
  .list {
    display: flex;
    flex-flow: row nowrap;
    font-size: 12px;
    gap: 25px;
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
  }
  .listItem {
    background-color: transparent;
    border: none;
    display: block;
    // padding: 5px 15px;
    cursor: pointer;
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
        &:after {
          // background-color: var(--color-primary);
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }

  .label {
    display: block;
    position: relative;
    padding: 8px 0;
    &:after {
      .mixin-after();
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      border-radius: 20px;
      background-color: transparent;
      transform: translateY(-4px);
      opacity: 0;
      background-color: var(--color-primary-alpha-300);
      transition: @transition-fast;
      transition-property: transform, opacity;
    }
  }
</style>
