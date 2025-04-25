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
  <Pic />
  <PlayInfo />
  <MiniPlayProgress />
  <ControlBtns />
  <PlayBtns />
</div>

<style lang="less">
  .player {
    position: relative;
    height: @height-player;
    // border-top: 3px solid var(--color-border);
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    contain: strict;
    // padding: 6px;
    padding-right: 10px;
    z-index: 2;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    backdrop-filter: blur(4px);
    // * {
    //   box-sizing: border-box;
    // }

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
</style>
