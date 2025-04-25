<script lang="ts">
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { settings } from './settings'
  import type { SettingListSection } from './settings'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar'
  import { t } from '@/plugins/i18n'

  let {
    active,
    onchange,
  }: {
    active?: SettingListSection['id']
    onchange: (id: string) => void
  } = $props()

  let domList: HTMLDivElement
</script>

<div class="settings-app-list">
  <div bind:this={domList} class="list" use:verticalScrollbar={{ offset: '0', scrollbarWidth: '0.4rem' }}>
    {#each settings as item (item.id)}
      <div
        role="button"
        tabindex="0"
        class="list-item"
        class:active={item.id == active}
        aria-label={$t(item.name)}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            onchange(item.id)
          }
        }}
        onclick={() => {
          onchange(item.id)
        }}
      >
        {#if item.id == active}
          <SvgIcon name="angle-right-solid" />
        {/if}
        {$t(item.name)}
      </div>
    {/each}
  </div>
</div>

<style lang="less">
  .settings-app-list {
    flex: none;
    overflow: hidden;
    width: 18%;
    max-width: 200px;
    margin-left: 12px;
    margin-bottom: 12px;
    // border-right: 1px solid var(--color-border);
    background-color: var(--color-primary-light-300-alpha-900);
    border-radius: @radius-border;
    // border-top-left-radius: 8px;
    // border-top-right-radius: 8px;
    // border-bottom-right-radius: 8px;

    .list {
      height: 100%;
    }
    .list-item {
      position: relative;
      transition: 0.3s ease;
      transition-property: color, background-color;
      background-color: transparent;
      display: block;
      padding: 0 10px;
      font-size: 13px;
      line-height: 36px;
      .mixin-ellipsis-1();
      border-radius: @radius-border;

      &:hover:not(.active) {
        background-color: var(--color-primary-background-hover);
        cursor: pointer;
      }
      &.active {
        // background-color:
        color: var(--color-primary);
      }

      & > :global(svg) {
        height: 0.9em;
        width: 0.9em;
        margin-left: -0.45em;
        vertical-align: -0.05em;
      }
    }
  }
</style>
