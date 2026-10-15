<script lang="ts">
  import { t } from '@/plugins/i18n'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import defaultSetting from '@any-listen/common/defaultSetting'
  const defaultFontSize = defaultSetting['playDetail.style.fontSize']
  const fontSize = useSettingValue('playDetail.style.fontSize')

  const setPlayDetailLyricFont = async (size: number) => {
    await updateSetting({ 'playDetail.style.fontSize': size })
  }

  const fontSizeUp = async (step: number) => {
    if (fontSize.val >= 200) return
    await setPlayDetailLyricFont(Math.min(fontSize.val + step, 200))
  }
  const fontSizeDown = async (step: number) => {
    if (fontSize.val <= 30) return
    await setPlayDetailLyricFont(Math.max(fontSize.val - step, 30))
  }
  const fontSizeReset = async () => {
    await setPlayDetailLyricFont(defaultFontSize)
  }
</script>

<div class="group">
  <div class="sub-group">
    <div class="title">{$t('lyric_menu.lrc_size', { size: fontSize.val })}</div>
    <button
      class="btn title-btn"
      disabled={fontSize.val == defaultFontSize}
      data-ignore-tip
      aria-label={$t('lyric_menu.size_reset')}
      onclick={fontSizeReset}
    >
      {$t('lyric_menu.size_reset')}
    </button>
  </div>
  <div class="sub-group">
    <button
      class="btn"
      aria-label={$t('lyric_menu.size_add')}
      onclick={async () => fontSizeUp(10)}
      oncontextmenu={async () => fontSizeUp(1)}
    >
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24">
        <use href="#icon-font-increase" />
      </svg>
    </button>
    <button
      class="btn"
      aria-label={$t('lyric_menu.size_dec')}
      onclick={async () => fontSizeDown(10)}
      oncontextmenu={async () => fontSizeDown(1)}
    >
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24">
        <use href="#icon-font-decrease" />
      </svg>
    </button>
  </div>
</div>
