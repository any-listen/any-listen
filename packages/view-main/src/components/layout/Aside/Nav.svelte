<script lang="ts">
  // import { appSetting } from '@/store/setting'
  import { link, location, query } from '@/plugins/routes'
  import { t } from '@/plugins/i18n'
  import { LIST_IDS } from '@any-listen/common/constants'
  import { useExtensionError, useExtensionNewVersionNum } from '@/modules/extension/reactive.svelte'
  import { useOnlineResourceAvailable } from '@/views/Online/shared.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { toOnlineSearch } from '@/modules/resource/actions'

  const downloadEnabled = useSettingValue('download.enable')
  const lastPlayedUrl = `/library?id=${LIST_IDS.LAST_PLAYED}`

  const newExtVerNum = useExtensionNewVersionNum()
  const extensionError = useExtensionError()

  let onlineResourceAvailable = useOnlineResourceAvailable()

  let menus = $derived(
    [
      // {
      //   to: '/search',
      //   name: $t('search'),
      //   icon: '#icon-search-2',
      //   iconSize: '0 0 425.2 425.2',
      //   enable: true,
      // },
      // {
      //   to: '/songList/list',
      //   name: $t('song_list'),
      //   icon: '#icon-album',
      //   iconSize: '0 0 425.2 425.2',
      //   enable: true,
      // },
      {
        to: '/online',
        name: $t('online_resources'),
        icon: '#icon-sound_cloud',
        iconSize: '0 0 24 24',
        enable: onlineResourceAvailable.val,
        onclick: (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          void toOnlineSearch()
        },
      },
      // {
      //   to: '/online',
      //   name: $t('list_name__love'),
      //   icon: '#icon-love',
      //   iconSize: '0 0 444.87 391.18',
      //   enable: true,
      // },
      // {
      //   to: '/library',
      //   name: $t('list_name__default'),
      //   icon: '#icon-love',
      //   iconSize: '0 0 444.87 391.18',
      //   enable: true,
      // },
      {
        to: lastPlayedUrl,
        name: $t('list_name__last_play'),
        icon: '#icon-memories',
        iconSize: '0 0 24 24',
        enable: true,
      },
      {
        to: '/download',
        name: $t('download.tasks'),
        icon: '#icon-download-2',
        iconSize: '0 0 425.2 425.2',
        enable: downloadEnabled.val,
      },
      {
        to: '/settings',
        name: $t('setting'),
        icon: '#icon-settings',
        iconSize: '0 0 24 24',
        enable: true,
      },
      {
        to: '/extenstion',
        name: $t('extenstion'),
        icon: '#icon-puzzle',
        iconSize: '0 0 24 24',
        enable: true,
        hidden: true,
      },
    ].filter((m) => m.enable)
  )

  let activePath = $derived.by(() => {
    if ($location == '/library' && $query.id == LIST_IDS.LAST_PLAYED) {
      return lastPlayedUrl
    } else if ($location.startsWith('/online/')) {
      return '/online'
    }
    return menus.some((m) => m.to == $location) ? $location : $location == '/' ? menus[0].to : ''
  })
  // let activePath = ''
</script>

{#snippet listItem(item: {
  to: string
  name: string
  icon: string
  iconSize: string
  enable: boolean
  badgeNum?: number
  waringBadge?: boolean
  onclick?: (e: MouseEvent) => void
})}
  <li class="nav-item" role="presentation">
    <a
      class="link"
      class:active={activePath == item.to}
      role="tab"
      data-ignore-tip
      aria-selected={activePath == item.to}
      href={item.to}
      onclick={item.onclick}
      aria-label={item.name}
      {@attach link({ disabled: !!item.onclick })}
    >
      <!-- <a class="link" class:active={activePath == item.to} role="tab" href={item.to} aria-label={item.name}> -->
      <div class="left">
        <div class="icon">
          <svg viewBox={item.iconSize}>
            <use xlink:href={item.icon} />
          </svg>
        </div>
        <span class="nav-name">{item.name}</span>
      </div>
      <div class="right">
        {#if item.waringBadge}
          <div class="icon" style="color: var(--color-font-error);">
            <svg viewBox={item.iconSize}>
              <use xlink:href="#icon-error" />
            </svg>
          </div>
        {/if}
        {#if item.badgeNum}
          <span class="badge" aria-hidden="true">{item.badgeNum}</span>
        {/if}
      </div>
    </a>
  </li>
{/snippet}
{#snippet extensonItem()}
  {@render listItem({
    to: '/extenstion',
    name: $t('extenstion'),
    icon: '#icon-puzzle',
    iconSize: '0 0 24 24',
    enable: true,
    waringBadge: extensionError.val,
    badgeNum: newExtVerNum.val > 0 ? newExtVerNum.val : undefined,
  })}
{/snippet}

<ul class="aside-nav" role="menu">
  {#each menus as item (item.to)}
    {#if !item.hidden}
      {@render listItem(item)}
    {/if}
  {/each}
  {@render extensonItem()}
</ul>

<style lang="less">
  .aside-nav {
    display: flex;
    flex: none;
    flex-flow: column nowrap;
    padding: 0 12px;
  }
  .nav-item {
    position: relative;
  }
  .link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    color: var(--color-primary-font);
    text-decoration: none;
    cursor: pointer;
    // font-size: 12px;
    outline: none;
    border-radius: @radius-border;
    transition: @transition-fast;
    transition-property: background-color, opacity;
    .mixin-ellipsis-1();

    &.active {
      cursor: default;
      // border-left-color: @color-theme-active;
      background-color: var(--color-primary-light-300-alpha-700);
    }

    &:hover {
      // color: var(--color-primary-font);

      &:not(.active) {
        background-color: var(--color-primary-light-400-alpha-700);
        opacity: 0.8;
      }
    }
    &:active:not(.active) {
      background-color: var(--color-primary-light-300-alpha-600);
      opacity: 0.6;
    }
  }

  .left {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .right {
    display: flex;
    flex: none;
    gap: 3px;
    align-items: center;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    color: var(--color-primary-font);
    background-color: var(--color-primary-background);
    border-radius: 8px;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    // margin-bottom: 5px;
    // margin-right: 6px;
    & > svg {
      height: 20px;
    }
  }
  .nav-name {
    font-size: 13px;
    line-height: 1.2;
  }
</style>
