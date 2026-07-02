<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    name,
    text,
    align = 'center',
    children,
  }: {
    name?: string
    text?: string
    align?: 'left' | 'center' | 'right'
    children?: Snippet
  } = $props()

  const content = $derived(children ? undefined : (text ?? name))
</script>

<div class="hr-item hr-align-{align}">
  <span class="hr-line"></span>
  {#if children}
    <span class="hr-text">
      {@render children()}
    </span>
  {:else if content}
    <span class="hr-text">{content}</span>
  {/if}
  <span class="hr-line"></span>
</div>

<style lang="less">
  .hr-item {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    margin: 20px 0;

    .hr-line {
      min-width: 0;
      border-top: 1px solid var(--hr-color, var(--color-border));
    }

    .hr-text {
      flex: 0 0 auto;
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
      opacity: 0.7;
    }

    &.hr-align-left {
      .hr-line:first-child {
        flex: 0;
        width: 16px;
      }

      .hr-line:last-child {
        flex: 1;
      }
    }

    &.hr-align-center {
      .hr-line {
        flex: 1;
      }
    }

    &.hr-align-right {
      .hr-line:first-child {
        flex: 1;
      }

      .hr-line:last-child {
        flex: 0;
        width: 16px;
      }
    }
  }
</style>
