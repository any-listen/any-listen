<script lang="ts">
  import Logo from './Logo.svelte'
  import ControlBtns from './ControlBtns.svelte'
  import SearchInput from './SearchInput.svelte'
  import { windowDarg } from '@/shared/browser/widnow.svelte'

  let isFullscreen = false
</script>

{#if import.meta.env.VITE_IS_DESKTOP}
  <div class="toolbar drag" class:fullscreen={isFullscreen}>
    <div class="left">
      <SearchInput />
    </div>
    <!-- <SearchInput /> -->
    {#if import.meta.env.VITE_IS_MAC}
      <Logo />
    {:else}
      <ControlBtns />
    {/if}
  </div>
{/if}
{#if import.meta.env.VITE_IS_WEB}
  <div class="toolbar" class:fullscreen={isFullscreen} {@attach windowDarg}>
    <div class="left">
      <SearchInput />
    </div>
    <!-- <SearchInput /> -->
    <ControlBtns />
  </div>
{/if}

<style lang="less" module>
  .toolbar {
    position: relative;
    z-index: 2;
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    align-items: center;
    height: @height-toolbar;
    // justify-content: space-between;
    // background-color: var(--background-color);
    // border-bottom: 1px solid var(--color-border);

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
    display: flex;
    flex: auto;
    flex-flow: row nowrap;
    // gap: 25px;
    align-items: center;
    height: 100%;
    margin-left: 12px;
    :global(.search-input) {
      // background-color: transparent;
      // border-bottom: 2px solid var(--color-primary-background);
      &::placeholder {
        font-size: 0.98em;
        color: var(--color-button-font);
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
  // }
  // .search {
  //   margin-left: 20px;
  //   :global(.searchInput) {
  //     background-color: transparent;
  //     border-bottom: 2px solid var(--color-primary-background);
  //     &::placeholder {
  //       color: var(--color-button-font);
  //       font-size: .98em;
  //     }
  //   }
  // }
</style>
