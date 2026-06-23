<script lang="ts">
  import TogglePlayModeBtn from '@/components/common/TogglePlayModeBtn.svelte'
  import VolumeBtn from '@/components/common/VolumeBtn.svelte'
  import PlaylistBtn from '@/components/common/PlaylistBtn/index.svelte'
  // import CommentBtn from '@/components/common/CommentBtn.svelte'
  import PlayerMusicHeartBtn from '@/components/common/PlayerMusicHeartBtn.svelte'
  // import CommentBtn from '@/components/common/CommentBtn.svelte'
  import DesktopLyricBtn from '@/components/common/DesktopLyricBtn/index.svelte'
  // import PlaybackRateBtn from '@/components/common/PlaybackRateBtn.svelte'

  // import { t } from '@/plugins/i18n'
</script>

<div class="container">
  <!-- <button class="titleBtn" aria-label="$t('player__add_music_to')" onclick="addMusicTo">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" width="90%" viewBox="0 0 512 512" space="preserve">
      <use xlink:href="#icon-add-2" />
    </svg>
  </button> -->
  <!-- <button class="titleBtn" aria-label="toggleDesktopLyricBtnTitle" onclick="toggleDesktopLyric" @contextmenu="toggleLockDesktopLyric">
    <svg v-show="appSetting['desktopLyric.enable']" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 512 512" space="preserve">
      <use xlink:href="#icon-desktop-lyric-on" />
    </svg>
    <svg v-show="!appSetting['desktopLyric.enable']" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 512 512" space="preserve">
      <use xlink:href="#icon-desktop-lyric-off" />
    </svg>
  </button> -->
  <PlayerMusicHeartBtn />
  <PlaylistBtn />
  <!-- <CommentBtn /> -->
  <!-- <CommentBtn /> -->
  <VolumeBtn />
  <TogglePlayModeBtn />
  <DesktopLyricBtn />
  <!-- <PlaybackRateBtn /> -->
  <!-- <SoundEffectBtn /> -->
  <!-- <common-toggle-play-mode-btn />
  <common-list-add-modal v-model:show="isShowAddMusicTo" :music-info="playMusicInfo.musicInfo" /> -->
</div>

<style lang="less">
  .container {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    gap: 15px;
    padding-right: 10px;
    padding-left: 20px;

    //   button {
    //     color: var(--color-button-font);
    //   }
  }

  // .titleBtn {
  //   flex: none;
  //   height: 100%;
  //   width: 24px;
  //   transition: @transition-fast;
  //   transition-property: color, opacity;
  //   // color: var(--color-button-font);
  //   display: flex;
  //   flex-flow: column nowrap;
  //   justify-content: center;
  //   align-items: center;
  //   background-color: transparent;
  //   border: none;
  //   width: 24px;
  //   padding: 0;

  //   opacity: .6;
  //   cursor: pointer;

  //   // svg {
  //   //   filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  //   // }
  //   &:hover {
  //     opacity: 1;
  //   }
  //   &:active {
  //     opacity: 1;
  //   }
  // }
</style>
