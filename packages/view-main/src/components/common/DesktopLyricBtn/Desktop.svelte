<script lang="ts">
  import { t } from '@/plugins/i18n'
  import Btn from '../../base/Btn.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import { settingState } from '@/modules/setting/store/state'
  const desktopLyricEnable = useSettingValue('desktopLyric.enable')
  let toggleDesktopLyricBtnTitle = $derived(
    `${desktopLyricEnable.val ? $t('player.desktop_lyric_off') : $t('player.desktop_lyric_on')}\n(${
      desktopLyricEnable.val ? $t('player.desktop_lyric_unlock') : $t('player.desktop_lyric_lock')
    })`
  )
</script>

<div class="icon">
  <Btn
    icon
    link
    onclick={async () => {
      await updateSetting({ 'desktopLyric.enable': !settingState.setting['desktopLyric.enable'] })
    }}
    oncontextmenu={async (e) => {
      e.preventDefault()
      await updateSetting({ 'desktopLyric.isLock': !settingState.setting['desktopLyric.isLock'] })
    }}
    aria-label={toggleDesktopLyricBtnTitle}
  >
    {#if desktopLyricEnable.val}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 512 512">
        <use xlink:href="#icon-desktop-lyric-on" />
      </svg>
    {:else}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 512 512">
        <use xlink:href="#icon-desktop-lyric-off" />
      </svg>
    {/if}
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
      transition-property: opacity @transition-normal;

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
