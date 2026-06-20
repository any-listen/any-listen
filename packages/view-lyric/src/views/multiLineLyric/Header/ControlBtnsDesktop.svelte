<script lang="ts">
  import { t } from '@/plugins/i18n'
  import { updateSetting } from '@/modules/setting/store/action'
  import { settingState } from '@/modules/setting/store/state'
  import { useSetting } from '@/modules/setting/reactive.svelte'

  const setting = useSetting()

  const handleClose = async () => {
    await updateSetting({ 'desktopLyric.enable': false })
  }

  const handleLock = async () => {
    await updateSetting({ 'desktopLyric.isLock': true })
  }

  const handleAlwaysOnTop = async () => {
    await updateSetting({ 'desktopLyric.isAlwaysOnTop': !settingState.setting['desktopLyric.isAlwaysOnTop'] })
  }

  const handleZoomLrc = async () => {
    await updateSetting({ 'desktopLyric.style.isZoomActiveLrc': !settingState.setting['desktopLyric.style.isZoomActiveLrc'] })
  }

  const handleFontChange = async (action: 'increase' | 'decrease', step: number) => {
    let num = settingState.setting['desktopLyric.style.fontSize']
    switch (action) {
      case 'increase':
        num = Math.min(settingState.setting['desktopLyric.style.fontSize'] + step, 80)
        break
      case 'decrease':
        num = Math.max(settingState.setting['desktopLyric.style.fontSize'] - step, 10)
        break
    }
    if (settingState.setting['desktopLyric.style.fontSize'] == num) return
    await updateSetting({ 'desktopLyric.style.fontSize': num })
  }

  const handleOpacityChange = async (action: 'increase' | 'decrease', step: number) => {
    let num = settingState.setting['desktopLyric.style.opacity']
    switch (action) {
      case 'increase':
        num = Math.min(settingState.setting['desktopLyric.style.opacity'] + step, 100)
        break
      case 'decrease':
        num = Math.max(settingState.setting['desktopLyric.style.opacity'] - step, 6)
        break
    }
    if (settingState.setting['desktopLyric.style.opacity'] == num) return
    await updateSetting({ 'desktopLyric.style.opacity': num })
  }

  const stopMenu = (event: MouseEvent) => {
    event.preventDefault()
  }
</script>

<button class="btn" title={$t('desktop_lyric.close')} onclick={handleClose}>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
    <use xlink:href="#icon-close" />
  </svg>
</button>
<button class="btn" title={$t(`desktop_lyric.${setting.val['desktopLyric.isLock'] ? 'unlock' : 'lock'}`)} onclick={handleLock}>
  {#if setting.val['desktopLyric.isLock']}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
      <use xlink:href="#icon-unlock" />
    </svg>
  {:else}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
      <use xlink:href="#icon-lock" />
    </svg>
  {/if}
</button>
<button class="btn" title={$t('desktop_lyric.font_increase')} onclick={async () => handleFontChange('increase', 1)}>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
    <use xlink:href="#icon-font-increase" />
  </svg>
</button>
<button class="btn" title={$t('desktop_lyric.font_decrease')} onclick={async () => handleFontChange('decrease', 1)}>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
    <use xlink:href="#icon-font-decrease" />
  </svg>
</button>
<button
  class="btn"
  title={$t('desktop_lyric.opacity_increase')}
  onclick={async () => handleOpacityChange('increase', 10)}
  oncontextmenu={(event) => {
    stopMenu(event)
    void handleOpacityChange('increase', 2)
  }}
>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
    <use xlink:href="#icon-opactiy-increase" />
  </svg>
</button>
<button
  class="btn"
  title={$t('desktop_lyric.opacity_decrease')}
  onclick={async () => handleOpacityChange('decrease', 10)}
  oncontextmenu={(event) => {
    stopMenu(event)
    void handleOpacityChange('decrease', 2)
  }}
>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
    <use xlink:href="#icon-opactiy-decrease" />
  </svg>
</button>
<button
  class="btn"
  title={$t(`desktop_lyric.${setting.val['desktopLyric.style.isZoomActiveLrc'] ? 'lrc_active_zoom_off' : 'lrc_active_zoom_on'}`)}
  onclick={handleZoomLrc}
>
  {#if setting.val['desktopLyric.style.isZoomActiveLrc']}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
      <use xlink:href="#icon-vibrate-off" />
    </svg>
  {:else}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
      <use xlink:href="#icon-vibrate" />
    </svg>
  {/if}
</button>
<button
  class="btn"
  title={$t(`desktop_lyric.${setting.val['desktopLyric.isAlwaysOnTop'] ? 'win_top_off' : 'win_top_on'}`)}
  onclick={handleAlwaysOnTop}
>
  {#if setting.val['desktopLyric.isAlwaysOnTop']}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
      <use xlink:href="#icon-top-off" />
    </svg>
  {:else}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24">
      <use xlink:href="#icon-top-on" />
    </svg>
  {/if}
</button>
