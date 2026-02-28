<script>
  import Logo from './Logo.svelte'
  import Nav from './Nav.svelte'
  import MyList from './MyList/index.svelte'
  // import { useSettingValue } from '@/modules/setting/reactive.svelte'
  // export let params = {}

  // console.log(params)
</script>

<div class="aside">
  {#if !import.meta.env.VITE_IS_MAC}
    <Logo />
  {/if}
  <Nav />
  <MyList />
</div>

<style lang="less">
  .aside {
    // background-color: var(--color-primary-light-900-alpha-900);
    display: flex;
    flex: none;
    flex-flow: column nowrap;
    width: 20%;
    max-width: 320px;
    // box-shadow: 0 0 5px rgba(0, 0, 0, .3);
    // transition: @transition-normal;
    // transition-property: background-color;
    // background-color: @color-theme-sidebar;
    // background-color: @color-aside-background;
    // border-right: 2px solid var(--color-primary);
    // -webkit-user-select: none;
    background-color: var(--color-app-background);

    // &.fullscreen {
    //   .logo {
    //     display: none;
    //   }
    // }
    // TODO: 兼容MAC
    // :global(.aside-logo + .aside-nav) {
    //   padding-top: 20px;
    // }
  }

  :global(html.desktop.mac .aside) {
    padding-top: calc(env(titlebar-area-height, 30px) + 4px);
  }

  // :global(html.mac .aside-nav) {
  //   padding-top: env(titlebar-area-height, 30px);
  // }
</style>
