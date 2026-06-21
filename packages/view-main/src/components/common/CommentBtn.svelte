<script lang="ts">
  import { t } from '@/plugins/i18n'
  import Btn from '../base/Btn.svelte'
  import { showMusicComment } from '@/modules/player/store/actions'
</script>

<div class="icon">
  <Btn icon link onclick={showMusicComment} aria-label={$t('music_comment_btn')}>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
      <use xlink:href="#icon-chat" />
    </svg>
  </Btn>
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
      color: inherit !important;
      opacity: 0.5;
      transition: opacity @transition-normal;

      svg {
        filter: drop-shadow(0 0 1px rgb(0 0 0 / 20%));
      }
      &:hover {
        opacity: 0.9;
      }
      &:active {
        opacity: 1;
      }
    }
  }
</style>
