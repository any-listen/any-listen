<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'

  let {
    min = false,
    middle = false,
    outline = false,
    link = false,
    disabled = false,
    loading = false,
    onclick,
    oncontextmenu,
    onmouseenter,
    onmouseleave,
    icon = false,
    icontext = false,
    children,
    rawtype = 'button',
    'aria-label': arialabel,
  }: {
    min?: boolean
    middle?: boolean
    outline?: boolean
    link?: boolean
    disabled?: boolean
    loading?: boolean
    'aria-label'?: string
    icon?: boolean
    icontext?: boolean
    rawtype?: 'button' | 'submit' | 'reset'
    onclick?: (event: Parameters<MouseEventHandler<HTMLButtonElement>>[0]) => Promise<unknown> | unknown
    oncontextmenu?: MouseEventHandler<HTMLButtonElement>
    onmouseenter?: MouseEventHandler<HTMLButtonElement>
    onmouseleave?: MouseEventHandler<HTMLButtonElement>
    children: Snippet
  } = $props()

  let asyncLoading = $state(false)
</script>

<button
  type={rawtype}
  class={['btn', { min, middle, outline, link, icon, icontext, loading: loading || asyncLoading }]}
  tabindex="0"
  aria-label={arialabel}
  disabled={disabled || loading || asyncLoading}
  onclick={(event) => {
    if (!onclick) return
    let p = onclick(event)
    if (p instanceof Promise) {
      asyncLoading = true
      void p.finally(() => {
        asyncLoading = false
      })
    }
  }}
  {oncontextmenu}
  {onmouseenter}
  {onmouseleave}
>
  {@render children()}
</button>

<style lang="less">
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 15px;
    font-size: 14px;
    color: var(--btn-font, var(--color-button-font));
    cursor: pointer;
    background-color: var(--color-button-background);
    border: none;
    border-radius: @form-radius;
    // outline: none;
    transition: @transition-normal;
    transition-property: background-color, opacity;
    &[disabled] {
      cursor: default;
      opacity: 0.4;
    }

    &.outline,
    &.link {
      background-color: transparent;
    }

    &:not(.link) {
      &:hover {
        background-color: var(--color-button-background-hover);
      }
      &:active {
        background-color: var(--color-button-background-active);
      }
    }
    &.link {
      padding: 0;
      transition-property: color, opacity;
      &:hover {
        color: var(--color-primary-font-hover);
      }
      &:active {
        color: var(--color-primary-font-active);
      }
    }

    &.icon {
      flex: none;
      width: var(--size, 2rem);
      height: var(--size, 2rem);
      padding: 5px;

      :global(svg) {
        width: 100%;
        height: 100%;
      }
      &.min {
        width: var(--size, 1.6rem);
        height: var(--size, 1.6rem);
      }
    }
    &.icontext {
      gap: 2px;
    }

    // TODO: loading
    &.loading {
    }
  }
  .middle {
    padding: 6px 12px;
    font-size: 13px;
  }
  .min {
    padding: 2.5px 8px;
    font-size: 12px;
  }
</style>
