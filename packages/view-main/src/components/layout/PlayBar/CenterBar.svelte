<script>
  import PlayInfo from './components/PlayInfo.svelte'
  import Pic from './components/Pic.svelte'
  import PlayBtns from './components/PlayBtns.svelte'
  import ControlBtns from './components/ControlBtns.svelte'
  import MiniPlayProgress from './components/MiniPlayProgress.svelte'
  // export let params = {}

  // console.log(params)
</script>

<div class="player">
  <div class="side">
    <Pic />
    <PlayInfo />
  </div>
  <PlayBtns />
  <div class="side right">
    <MiniPlayProgress />
    <ControlBtns />
  </div>
</div>

<style lang="less">
  .player {
    position: relative;
    height: @height-player;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    contain: strict;
    // padding: 6px;
    z-index: 2;
    // box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
    * {
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

  .side {
    height: 100%;
    flex: 1;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    position: relative;
  }

  .right {
    justify-content: flex-end;
    padding-right: 10px;
    margin-left: -10px;
  }
</style>
