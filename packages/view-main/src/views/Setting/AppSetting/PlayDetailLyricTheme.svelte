<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import { settingState } from '@/modules/setting/store/state'
  import { t } from '@/plugins/i18n'
  import colorPick from '@/shared/compositions/colorPick.svelte'
  import { onMount } from 'svelte'
  import TitleContent from '../components/TitleContent.svelte'

  const colorContext = document.createElement('canvas').getContext('2d')!
  const getThemeColor = (name: string) => {
    colorContext.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return colorContext.fillStyle
  }
  const unplayDefault = getThemeColor('--color-300')
  const playedDefault = getThemeColor('--color-primary-dark-100')
  const shadowDefault = getThemeColor('--color-primary-dark-700-alpha-900')

  const lyricUnplayColor = colorPick(
    settingState.setting['playDetail.style.lyricUnplayColor'] || unplayDefault,
    [
      'rgba(255, 255, 255, 1)',
      'rgba(255, 236, 144, 1)',
      'rgba(144, 255, 206, 1)',
      'rgba(32, 255, 132, 1)',
      'rgba(255, 226, 32, 1)',
      'rgba(57, 203, 255, 1)',
      'rgba(217, 57, 255, 1)',
      'rgba(255, 57, 71, 1)',
    ],
    (val) => void updateSetting({ 'playDetail.style.lyricUnplayColor': val })
  )
  const lyricPlayedColor = colorPick(
    settingState.setting['playDetail.style.lyricPlayedColor'] || playedDefault,
    [
      'rgba(255, 236, 144, 1)',
      'rgba(144, 255, 206, 1)',
      'rgba(32, 255, 132, 1)',
      'rgba(255, 226, 32, 1)',
      'rgba(57, 203, 255, 1)',
      'rgba(25, 181, 254, 1)',
      'rgba(113, 135, 255, 1)',
      'rgba(217, 57, 255, 1)',
      'rgba(255, 57, 71, 1)',
    ],
    (val) => void updateSetting({ 'playDetail.style.lyricPlayedColor': val })
  )
  const lyricShadowColor = colorPick(
    settingState.setting['playDetail.style.lyricShadowColor'] || shadowDefault,
    ['rgba(0, 0, 0, 0.6)'],
    (val) => void updateSetting({ 'playDetail.style.lyricShadowColor': val })
  )

  const resetColor = () => {
    void updateSetting({
      'playDetail.style.lyricUnplayColor': '',
      'playDetail.style.lyricPlayedColor': '',
      'playDetail.style.lyricShadowColor': '',
    })
    lyricUnplayColor.setColor(unplayDefault)
    lyricPlayedColor.setColor(playedDefault)
    lyricShadowColor.setColor(shadowDefault)
  }

  onMount(() => {
    lyricUnplayColor.setColor(settingState.setting['playDetail.style.lyricUnplayColor'] || unplayDefault)
    lyricPlayedColor.setColor(settingState.setting['playDetail.style.lyricPlayedColor'] || playedDefault)
    lyricShadowColor.setColor(settingState.setting['playDetail.style.lyricShadowColor'] || shadowDefault)
  })
</script>

<TitleContent name={$t('settings.play_detail.lyric_color')}>
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
  </div>
</TitleContent>

<style lang="less">
  .settings-item-content {
    display: flex;
    flex-flow: row wrap;
    gap: 40px;
    align-items: center;
    padding-top: 5px;
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
