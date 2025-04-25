<script lang="ts">
  // import { appSetting } from '@/store/setting'
  import { link, location, query } from '@/plugins/routes'
  import { t } from '@/plugins/i18n'
  import { LIST_IDS } from '@any-listen/common/constants'

  const lastPlayedUrl = `/library?id=${LIST_IDS.LAST_PLAYED}`

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
      // {
      //   to: '/online',
      //   name: $t('online_resources'),
      //   icon: '#icon-leaderboard',
      //   iconSize: '0 0 425.22 425.2',
      //   enable: true,
      // },
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
        icon: '#icon-love',
        iconSize: '0 0 444.87 391.18',
        enable: true,
      },
      // {
      //   to: '/download',
      //   name: $t('download'),
      //   icon: '#icon-download-2',
      //   iconSize: '0 0 425.2 425.2',
      //   // enable: appSetting['download.enable'],
      //   enable: true,
      // },
      {
        to: '/settings',
        name: $t('setting'),
        icon: '#icon-setting',
        iconSize: '0 0 493.23 436.47',
        enable: true,
      },
      {
        to: '/extenstion',
        name: $t('extenstion'),
        icon: '#icon-extenstion',
        iconSize: '0 0 493.23 436.47',
        enable: true,
      },
    ].filter((m) => m.enable)
  )

  let activePath = $derived(
    $location == '/library' && $query.id == LIST_IDS.LAST_PLAYED
      ? lastPlayedUrl
      : menus.some((m) => m.to == $location)
        ? $location
        : $location == '/'
          ? menus[0].to
          : ''
  )
  // let activePath = ''
</script>

<ul class="aside-nav" role="menu">
  {#each menus as item (item.to)}
    <li class="navItem" role="presentation">
      <a
        class="link"
        class:active={activePath == item.to}
        role="tab"
        data-ignore-tip
        aria-selected={activePath == item.to}
        href={item.to}
        aria-label={item.name}
        use:link
      >
        <!-- <a class="link" class:active={activePath == item.to} role="tab" href={item.to} aria-label={item.name}> -->
        <!-- <div class="icon">
          <svg viewBox={item.iconSize}>
            <use xlink:href={item.icon} />
          </svg>
        </div> -->
        <span class="navName">{item.name}</span>
      </a>
    </li>
  {/each}
</ul>

<style lang="less">
  .aside-nav {
    flex: none;
    padding: 20px 12px 0;
    display: flex;
    flex-flow: column nowrap;
  }
  .navItem {
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
      cursor: default;
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

  // .icon {
  //   // margin-bottom: 5px;
  //   margin-right: 5px;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   height: 15px;
  //   &> svg {
  //     height: 15px;
  //   }
  // }
  .navName {
    line-height: 1.2;
    font-size: 13px;
  }
</style>
