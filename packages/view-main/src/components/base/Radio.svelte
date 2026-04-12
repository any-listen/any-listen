<script lang="ts" generics="T">
  import type { Snippet } from 'svelte'
  let {
    value,
    checked,
    id,
    name,
    arialabel,
    label,
    disabled = false,
    onselect,
    children,
  }: {
    value: T
    checked?: boolean
    id: string
    name?: string
    arialabel?: string
    label?: string
    disabled?: boolean
    onselect: (value: T) => void
    children?: Snippet
  } = $props()
</script>

<div class="radio">
  <input
    {id}
    type="radio"
    aria-hidden="true"
    class="input"
    {checked}
    {disabled}
    {value}
    {name}
    oninput={() => {
      onselect(value)
    }}
  />
  <label for={id} class="content">
    <div
      class="container"
      role="radio"
      tabindex="0"
      aria-label={arialabel ?? label}
      aria-checked={checked}
      aria-disabled={disabled}
      onkeydown={(event) => {
        if (disabled) return
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault()
            event.stopPropagation()
            onselect(value)
            break
        }
      }}
    >
      <svg version="1.1" class="icon" xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 32 448 448">
        <use xlink:href="#icon-check-true" />
      </svg>
    </div>
    {#if children}
      {@render children()}
    {:else}
      <span class="label">
        {label}
      </span>
    {/if}
  </label>
</div>

<style lang="less">
  .radio {
    display: inline-block;
    // font-size: 56px;
  }
  .input {
    display: none;
    &[disabled] {
      + .content {
        opacity: 0.5;
        .container,
        .label {
          cursor: default;
        }
      }
    }
    &:checked {
      + .content {
        .container {
          &::after {
            border-color: var(--color-primary-font);
          }
        }
        .icon {
          transform: scale(1);
          // opacity: 1;
        }
      }
    }
  }
  .content {
    display: flex;
    align-items: center;
    transition: @transition-normal;
    transition-property: opacity;
  }
  .container {
    position: relative;
    display: flex;
    flex: none;
    width: 1em;
    height: 1em;
    color: var(--color-primary);
    cursor: pointer;
    // border: 1px solid #ccc;
    &::after {
      position: absolute;
      inset: 0;
      content: ' ';
      border: 1px solid var(--color-font-label);
      border-radius: 2px;
      transition: border-color 0.2s ease;
    }
  }
  .icon {
    border-radius: 2px;
    transform: scale(0);
    transition: 0.3s ease;
    transition-property: transform;
    // opacity: 0;
  }

  .label {
    flex: auto;
    margin-left: 6px;
    font-size: 14px;
    line-height: 1.5;
    cursor: pointer;
  }
</style>
