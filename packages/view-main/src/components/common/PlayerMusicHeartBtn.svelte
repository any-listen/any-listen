<script lang="ts">
  import MusicHeartBtn from './MusicHeartBtn.svelte'
  import { playMusicInfo } from '@/modules/player/reactive.svelte'
</script>

<div class="icon">
  <MusicHeartBtn musicinfo={$playMusicInfo?.musicInfo} link />
</div>

<style lang="less">
  // .container {
  //   flex: none;
  //   height: 100%;
  // }

  .icon :global {
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      // color: inherit !important;
      // opacity: 0.5;
      // transition-property: opacity @transition-normal;

      svg {
        filter: drop-shadow(0 0 1px rgb(0 0 0 / 20%));
        &:hover {
          opacity: 0.9;
        }
        &:active {
          opacity: 1;
        }
      }
    }
  }
</style>
