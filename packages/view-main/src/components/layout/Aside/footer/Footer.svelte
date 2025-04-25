<script lang="ts">
  // import { appSetting } from '@/store/setting'
  import { link, location } from '@/plugins/routes'
  import { t } from '@/plugins/i18n'
  import { LIST_IDS } from '@any-listen/common/constants'

  const lastPlayedUrl = `/library?id=${LIST_IDS.LAST_PLAYED}`

  const buttons: Array<{
    to: string
    name: string
    icon: string
    iconSize: string
  }> = [
    {
      to: '/online',
      name: $t('online_resources'),
      icon: '#icon-extenstion',
      iconSize: '0 0 50 50',
    },
    {
      to: lastPlayedUrl,
      name: $t('list_name__last_play'),
      icon: '#icon-settings',
      iconSize: '0 0 512 512',
    },
  ]
</script>

<ul class="aside-footer-menu" role="menu">
  {#each buttons as item (item.to)}
    <li class="menu-item" role="presentation">
      <a
        class="menu-link"
        class:active={$location == item.to}
        role="tab"
        aria-selected={$location == item.to}
        href={item.to}
        aria-label={item.name}
        use:link
      >
        <div class="menu-icon">
          <svg viewBox={item.iconSize}>
            <use xlink:href={item.icon} />
          </svg>
        </div>
        <span class="menu-name">{item.name}</span>
      </a>
    </li>
  {/each}
</ul>

<style lang="less">
  .aside-footer-menu {
    flex: none;
    padding: 0 12px;
    display: flex;
    flex-flow: column nowrap;
  }
  .menu-item {
    position: relative;
  }
  .link {
    text-decoration: none;
    padding: 10px 15px;
    transition: @transition-fast;
    transition-property: background-color, opacity;
    color: var(--color-primary-font);
    cursor: pointer;
    // font-size: 12px;
    outline: none;
    display: flex;
    border-radius: @radius-border;
    .mixin-ellipsis-1();

    &.active {
      // border-left-color: @color-theme-active;
      background-color: var(--color-primary-light-300-alpha-700);
    }

    &:hover {
      // color: var(--color-primary-font);

      &:not(.active) {
        opacity: 0.8;
        background-color: var(--color-primary-light-400-alpha-700);
      }
    }
    &:active:not(.active) {
      opacity: 0.6;
      background-color: var(--color-primary-light-300-alpha-600);
    }
  }

  .menu-icon {
    // margin-bottom: 5px;
    margin-right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 15px;
    & > svg {
      height: 15px;
    }
  }
  .menu-name {
    line-height: 1.2;
    font-size: 13px;
  }
</style>
