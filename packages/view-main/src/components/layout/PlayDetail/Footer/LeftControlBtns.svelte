<script lang="ts">
  // import TogglePlayModeBtn from '@/components/common/TogglePlayModeBtn.svelte'
  // import VolumeBtn from '@/components/common/VolumeBtn.svelte'
  import SoundEffectBtn from '@/components/common/SoundEffectBtn/index.svelte'
  // import PlaylistBtn from '@/components/common/PlaylistBtn/index.svelte'
  import PlaybackRateBtn from '@/components/common/PlaybackRateBtn.svelte'
  import CommentBtn from '@/components/common/CommentBtn.svelte'
</script>

<div class="container">
  <!-- <PlaylistBtn /> -->
  <!-- <VolumeBtn /> -->
  <!-- <TogglePlayModeBtn /> -->
  <SoundEffectBtn />
  <PlaybackRateBtn />
  <CommentBtn />
</div>

<style lang="less">
  .container {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    gap: 15px;
  }
</style>
