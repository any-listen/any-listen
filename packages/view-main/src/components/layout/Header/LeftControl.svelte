<script lang="ts">
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import Logo from './Logo.svelte'
  // import { isFullscreen } from '@/store'
  // import { appSetting } from '@/store/setting'
  // import ControlBtns from './ControlBtns.svelte'
  import SearchInput from './SearchInput.svelte'
  import { windowDarg } from '@/shared/browser/widnow'
  // import SearchInput from './SearchInput.vue'

  let isFullscreen = false

  let controlBtnPosition = useSettingValue('common.controlBtnPosition')
</script>

{#if import.meta.env.VITE_IS_DESKTOP}
  <div class="toolbar" class:fullscreen={isFullscreen}>
    <div class="left">
      <SearchInput />
    </div>
    <!-- <SearchInput /> -->
    <Logo />
  </div>
{/if}
{#if import.meta.env.VITE_IS_WEB}
  <div class="toolbar" class:fullscreen={isFullscreen} use:windowDarg>
    <div class="left">
      <SearchInput />
    </div>
    <!-- <SearchInput /> -->
    <Logo />
  </div>
{/if}

<style lang="less">
  .toolbar {
    position: relative;
    flex: none;
    display: flex;
    height: @height-toolbar;
    align-items: center;
    justify-content: space-between;
    -webkit-app-region: drag;
    z-index: 2;
    // background-color: var(--background-color);
    // border-bottom: 1px solid var(--color-border);

    &.fullscreen {
      -webkit-app-region: no-drag;
      // .logo {
      //   display: none;
      // }
    }

    // &:before {
    //   .mixin-after();
    //   left: 0;
    //   top: 0;
    //   width: 100%;
    //   height: 100%;
    //   background-color: var(--color-main-background);
    //   opacity: .9;
    //   z-index: -1;
    // }
  }

  .left {
    flex: auto;
    display: flex;
    flex-flow: row nowrap;
    height: 100%;
    // gap: 25px;
    align-items: center;

    margin-left: 12px;
    :global(.searchInput) {
      -webkit-app-region: no-drag;
      // background-color: transparent;
      // border-bottom: 2px solid var(--color-primary-background);
      &::placeholder {
        color: var(--color-button-font);
        font-size: 0.98em;
      }
    }
  }

  // .logo {
  //   box-sizing: border-box;
  //   padding: 0 @height-toolbar * .4;
  //   height: @height-toolbar;
  //   color: var(--color-primary);
  //   flex: none;
  //   text-align: center;
  //   line-height: @height-toolbar;
  //   font-weight: bold;
  //   // -webkit-app-region: no-drag;
  // }
</style>
