<script lang="ts">
  import type { Snippet } from 'svelte'
  let { children }: { children: Snippet } = $props()
</script>

<div class="btn-merge">
  {@render children()}
</div>

<style lang="less">
  .btn-merge {
    display: flex;
    flex-flow: row nowrap;

    > :global(*) {
      border-radius: 0 !important;
      &:first-child {
        border-top-left-radius: @form-radius !important;
        border-bottom-left-radius: @form-radius !important;
      }
      &:last-child {
        border-top-right-radius: @form-radius !important;
        border-bottom-right-radius: @form-radius !important;
      }
    }
  }
</style>
