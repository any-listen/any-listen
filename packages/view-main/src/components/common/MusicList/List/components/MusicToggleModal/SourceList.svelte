<script lang="ts">
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import { extI18n } from '@/modules/extension/i18n'

  let {
    list,
    active,
    onchange,
  }: {
    list: Array<{
      sId: `${string}_${string}`
      id: string
      extensionId: string
      name: string
    }>
    active: string
    onchange: (source: (typeof list)[number]) => void
  } = $props()
</script>

<div class="source-list">
  <div class="source-content" {@attach verticalScrollbar({ offset: '0', scrollbarWidth: '0.35rem' })}>
    {#each list as source (source.sId)}
      <div
        role="button"
        tabindex="0"
        class="source-item"
        class:active={source.sId == active}
        aria-label={extI18n.t(source.extensionId, source.name)}
        onkeydown={(event) => {
          if (event.key === 'Enter') onchange(source)
        }}
        onclick={() => {
          if (source.sId == active) return
          onchange(source)
        }}
      >
        {#if source.sId == active}
          <SvgIcon name="angle-right-solid" />
        {/if}
        {extI18n.t(source.extensionId, source.name)}
      </div>
    {/each}
  </div>
</div>

<style lang="less">
  .source-list {
    flex: none;
    width: 22%;
    min-width: 120px;
    max-width: 180px;
    overflow: hidden;
    background-color: var(--color-primary-light-300-alpha-900);
    border-radius: @radius-border;

    .source-content {
      height: 100%;
    }

    .source-item {
      position: relative;
      display: block;
      padding: 0 10px;
      font-size: 13px;
      line-height: 36px;
      background-color: transparent;
      border-radius: @radius-border;
      transition: 0.3s ease;
      transition-property: color, background-color;
      .mixin-ellipsis-1();

      &:hover:not(.active) {
        cursor: pointer;
        background-color: var(--color-primary-background-hover);
      }

      &.active {
        color: var(--color-primary);
      }

      & > :global(svg) {
        width: 0.9em;
        height: 0.9em;
        margin-left: -0.45em;
        vertical-align: -0.05em;
      }
    }
  }
</style>
