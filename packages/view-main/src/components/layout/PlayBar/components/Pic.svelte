<script lang="ts">
  import Image from '@/components/base/Image.svelte'
  import { scrollListTo } from '@/modules/app/store/action'
  import { musicInfo } from '@/modules/player/reactive.svelte'
  import { playerState } from '@/modules/player/store/state'
  let pic = $derived($musicInfo.pic)
</script>

<div class="container">
  <button
    type="button"
    class="btn"
    onclick={() => {}}
    oncontextmenu={() => {
      let mInfo = playerState.playMusicInfo
      if (!mInfo) return
      scrollListTo(mInfo.listId, mInfo.isOnline, mInfo.musicInfo.id)
    }}
  >
    <Image src={pic} />
  </button>
</div>

<style lang="less">
  .container {
    flex: none;
    // width: @height-player;
    height: 100%;
    min-width: 0;
    padding: 8px 10px;
  }
  .btn {
    display: block;
    border: none;
    background: none;
    height: 100%;
    // aspect-ratio: 1;
    padding: 0;
    transition: opacity @transition-fast;
    cursor: pointer;
    aspect-ratio: 1;

    &:hover {
      opacity: 0.6;
    }
  }
</style>
