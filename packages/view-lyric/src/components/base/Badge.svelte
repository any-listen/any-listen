<script lang="ts">
  let {
    label,
    type = 'primary',
    opacity = 1,
  }: { label: string; type?: 'primary' | 'secondary' | 'tertiary'; opacity?: number } = $props()
</script>

{#if type == 'primary'}
  <span class="badge primary" style:opacity>{label}</span>
{:else if type == 'secondary'}
  <span class="badge secondary">{label}</span>
{:else if type == 'tertiary'}
  <span class="badge tertiary">{label}</span>
{/if}

<style lang="less">
  .badge {
    display: inline-block;
    padding: 0.25em 0.4em;
    font-size: 0.7em;
    // font-weight: 700;
    line-height: 1.2;
    // vertical-align: baseline;
    vertical-align: text-top;
    text-align: center;
    white-space: nowrap;
    // border-radius: 2px;
    &.primary {
      color: var(--color-badge-primary);
    }
    &.secondary {
      color: var(--color-badge-secondary);
    }
    &.tertiary {
      color: var(--color-badge-tertiary);
    }
  }
</style>
