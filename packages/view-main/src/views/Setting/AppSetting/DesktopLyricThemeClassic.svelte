<script lang="ts">
  import { updateSetting } from '@/modules/setting/store/action'
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import { onMount } from 'svelte'
  import colorPick from '@/shared/compositions/colorPick.svelte'
  import { settingState } from '@/modules/setting/store/state'
  import Btn from '@/components/base/Btn.svelte'

  const lyricUnplayColor = colorPick(
    settingState.setting['desktopLyric.classic.style.lyricUnplayColor'],
    [
      'rgba(255, 255, 255, 1)',
      'rgba(255, 236, 144, 1)',
      'rgba(144, 255, 206, 1)',
      'rgba(32, 255, 132, 1)',
      'rgba(255, 226, 32, 1)',
      'rgba(255, 153, 52, 1)',
      'rgba(57, 203, 255, 1)',
      'rgba(217, 57, 255, 1)',
      'rgba(255, 57, 71, 1)',
    ],
    (val) => {
      void updateSetting({ 'desktopLyric.classic.style.lyricUnplayColor': val })
    }
  )
  const lyricPlayedColor = colorPick(
    settingState.setting['desktopLyric.classic.style.lyricPlayedColor'],
    [
      'rgba(255, 242, 87, 1)',
      'rgba(144, 255, 206, 1)',
      'rgba(32, 255, 132, 1)',
      'rgba(57, 203, 255, 1)',
      'rgba(25, 181, 254, 1)',
      'rgba(113, 135, 255, 1)',
      'rgba(217, 57, 255, 1)',
      'rgba(255, 57, 71, 1)',
    ],
    (val) => {
      void updateSetting({ 'desktopLyric.classic.style.lyricPlayedColor': val })
    }
  )
  const lyricShadowColor = colorPick(
    settingState.setting['desktopLyric.classic.style.lyricShadowColor'],
    [
      'rgba(0, 0, 0, 0.6)',
      'rgba(254, 72, 72, 1)',
      'rgba(71, 0, 255, 0.69)',
      //  'rgba(0, 0, 0, 0.15)'
    ],
    (val) => {
      void updateSetting({ 'desktopLyric.classic.style.lyricShadowColor': val })
    }
  )

  const resetColor = () => {
    const defaultSetting = {
      'desktopLyric.classic.style.lyricUnplayColor': 'rgba(87, 143, 255, 1)',
      'desktopLyric.classic.style.lyricPlayedColor': 'rgba(39, 249, 192, 1)',
      'desktopLyric.classic.style.lyricShadowColor': 'rgba(0, 0, 0, 0.6)',
    }
    void updateSetting(defaultSetting)
    lyricUnplayColor.setColor(defaultSetting['desktopLyric.classic.style.lyricUnplayColor'])
    lyricPlayedColor.setColor(defaultSetting['desktopLyric.classic.style.lyricPlayedColor'])
    lyricShadowColor.setColor(defaultSetting['desktopLyric.classic.style.lyricShadowColor'])
  }

  const resetWindow = () => {
    void updateSetting({
      'desktopLyric.classic.x': null,
      'desktopLyric.classic.y': null,
      // 'desktopLyric.classic.style.fontSize': 25,
    })
  }

  onMount(() => {
    lyricUnplayColor.setColor(settingState.setting['desktopLyric.classic.style.lyricUnplayColor'])
    lyricPlayedColor.setColor(settingState.setting['desktopLyric.classic.style.lyricPlayedColor'])
    lyricShadowColor.setColor(settingState.setting['desktopLyric.classic.style.lyricShadowColor'])
  })
</script>

<TitleContent name={$t('settings.desktopLyric.theme')}>
  <div class="settings-item-content gap-top">
    <div class="settings-item-content-item">
      <div class="settings-item-content-item-color" {@attach lyricUnplayColor.attach.bind(lyricUnplayColor)}></div>
      <div class="settings-item-content-item-label">{$t('settings.desktopLyric.unplay_color')}</div>
    </div>
    <div class="settings-item-content-item">
      <div class="settings-item-content-item-color" {@attach lyricPlayedColor.attach.bind(lyricPlayedColor)}></div>
      <div class="settings-item-content-item-label">{$t('settings.desktopLyric.played_color')}</div>
    </div>
    <div class="settings-item-content-item">
      <div class="settings-item-content-item-color" {@attach lyricShadowColor.attach.bind(lyricShadowColor)}></div>
      <div class="settings-item-content-item-label">{$t('settings.desktopLyric.shadow_color')}</div>
    </div>
  </div>
  <div class="settings-item-content btns gap-top">
    <Btn min onclick={resetColor}>{$t('settings.desktopLyric.color_reset')}</Btn>
    <Btn min onclick={resetWindow}>{$t('settings.desktopLyric.window_reset')}</Btn>
  </div>
</TitleContent>

<style lang="less">
  .settings-item-content {
    display: flex;
    flex-flow: row wrap;
    gap: 40px;
    align-items: center;
    padding-top: 5px;

    // :global(input) {
    //   height: 28px;
    //   padding: 0 4px;
    // }
  }
  .settings-item-content-item {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    width: 70px;
  }
  .settings-item-content-item-color {
    width: 80%;
    aspect-ratio: 1 / 1;
    cursor: pointer;
    background-color: var(--pcr-color);
    border-radius: @radius-border;
    box-shadow: 0 0 3px var(--color-primary-light-100-alpha-300);
    transition: @transition-fast !important;
    transition-property: background-color, opacity !important;
    &:hover {
      opacity: 0.7;
    }
  }
  .settings-item-content-item-label {
    .mixin-ellipsis-2();

    padding-top: 10px;
    line-height: 1.1;
    text-align: center;
  }

  .settings-item-content.btns {
    gap: 15px;
  }
</style>
