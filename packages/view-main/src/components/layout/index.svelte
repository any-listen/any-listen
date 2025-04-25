<script lang="ts">
  import Aside from '@/components/layout/Aside/index.svelte'
  import Header from '@/components/layout/Header/index.svelte'
  import Main from '@/components/layout/Main.svelte'
  import PlayBar from '@/components/layout/PlayBar/index.svelte'
</script>

<div id="app-main">
  <Aside />
  <div id="app-right">
    <Header />
    <Main />
  </div>
</div>
<PlayBar />

<style lang="less">
  #app-main {
    flex: auto;
    display: flex;
    flex-flow: row nowrap;
    position: relative;
    z-index: 1;
  }
  #app-right {
    flex: auto;
    display: flex;
    flex-flow: column nowrap;
    position: relative;
    // border-left: 2px solid var(--color-border);

    flex: auto;
    display: flex;
    flex-flow: column nowrap;

    // border-top-left-radius: @radius-border;
    // border-bottom-left-radius: @radius-border;
    overflow: hidden;
    // box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);

    // &:before {
    //   .mixin-after();
    //   left: 0;
    //   top: 0;
    //   width: 100%;
    //   height: 100%;
    //   transition: background-color @transition-normal;
    //   background-color: var(--color-main-background);
    //   opacity: .9;
    //   // z-index: -1;
    // }
  }
</style>
