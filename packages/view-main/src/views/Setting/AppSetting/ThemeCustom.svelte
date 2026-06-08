<script lang="ts">
  import { onMount } from 'svelte'

  import Checkbox from '@/components/base/Checkbox.svelte'
  import { createThemeColors, colorToHex, hexToRgb } from '@/modules/theme/colors'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { getThemeList, getThemeSetting, saveTheme } from '@/modules/theme/store/action'
  import { updateSetting } from '@/modules/setting/store/action'
  import { i18n, t } from '@/plugins/i18n'
  import { themeChangedEvent, themeListChangedEvent } from '@/shared/ipc/theme/event'

  import TitleContent from '../components/TitleContent.svelte'

  const CUSTOM_THEME_ID = 'custom'

  let sourceTheme = $state.raw<AnyListen.Theme | null>(null)
  let primaryColor = $state('#4f62d0')
  let fontColor = $state('#212121')
  let isDark = $state(false)
  let hasCustomTheme = $state(false)
  let themeIdSetting = useSettingValue('theme.id')
  let isCustomSelected = $derived(themeIdSetting.val == CUSTOM_THEME_ID)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const setForm = (theme: AnyListen.Theme | null) => {
    sourceTheme = theme
    primaryColor = colorToHex(theme?.config.themeColors['--color-primary'] ?? '', '#4f62d0')
    fontColor = colorToHex(theme?.config.themeColors['--color-1000'] ?? '', '#212121')
    isDark = theme?.isDark ?? false
  }

  const load = async () => {
    const [list, setting] = await Promise.all([getThemeList(), getThemeSetting()])
    const customTheme = list.userThemes.find((theme) => theme.id == CUSTOM_THEME_ID)
    hasCustomTheme = !!customTheme
    setForm(customTheme ?? list.themes.find((theme) => theme.id == setting.id) ?? list.themes[0] ?? null)
  }

  const createTheme = () => {
    if (!sourceTheme) return null
    return {
      ...sourceTheme,
      id: CUSTOM_THEME_ID,
      name: i18n.t('theme_custom'),
      isDark,
      isCustom: true,
      config: {
        themeColors: createThemeColors(hexToRgb(primaryColor), hexToRgb(fontColor), isDark),
        extInfo: {
          ...sourceTheme.config.extInfo,
        },
      },
    } satisfies AnyListen.Theme
  }

  const saveCurrentTheme = async () => {
    if (themeIdSetting.val != CUSTOM_THEME_ID) return
    const theme = createTheme()
    if (!theme) return

    await saveTheme(theme)
    const setting: Partial<AnyListen.AppSetting> = {
      'theme.id': CUSTOM_THEME_ID,
    }
    setting[theme.isDark ? 'theme.darkId' : 'theme.lightId'] = CUSTOM_THEME_ID
    await updateSetting(setting)
    sourceTheme = theme
    hasCustomTheme = true
  }

  const queueSave = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = null
      void saveCurrentTheme()
    }, 120)
  }

  $effect(() => {
    if (!isCustomSelected || !sourceTheme || hasCustomTheme) return
    queueSave()
  })

  onMount(() => {
    void load()
    const unregisterThemeChanged = themeChangedEvent.on(() => {
      void load()
    })
    const unregisterThemeListChanged = themeListChangedEvent.on(() => {
      void load()
    })
    return () => {
      if (saveTimer) clearTimeout(saveTimer)
      unregisterThemeChanged()
      unregisterThemeListChanged()
    }
  })
</script>

{#if isCustomSelected}
  <TitleContent name={$t('theme_edit_modal__title')}>
    <div class="theme-custom">
      <div class="form-row">
        <label>
          <span>{$t('theme_edit_modal__primary')}</span>
          <input
            class="color-input"
            type="color"
            value={primaryColor}
            aria-label={$t('theme_edit_modal__primary')}
            oninput={(event) => {
              primaryColor = (event.target as HTMLInputElement).value
              queueSave()
            }}
          />
        </label>
        <label>
          <span>{$t('theme_edit_modal__font')}</span>
          <input
            class="color-input"
            type="color"
            value={fontColor}
            aria-label={$t('theme_edit_modal__font')}
            oninput={(event) => {
              fontColor = (event.target as HTMLInputElement).value
              queueSave()
            }}
          />
        </label>
        <Checkbox
          id="setting_theme_custom_dark"
          checked={isDark}
          label={$t('theme_edit_modal__dark')}
          onchange={(checked) => {
            isDark = checked
            queueSave()
          }}
        />
      </div>
    </div>
  </TitleContent>
{/if}

<style lang="less">
  .theme-custom {
    display: flex;
    flex-flow: column nowrap;
    gap: 10px;
    margin-left: 16px;
    padding: 10px;
    background-color: var(--color-primary-light-100-alpha-900);
    border-radius: @radius-border;
  }
  .form-row {
    display: flex;
    flex-flow: row wrap;
    gap: 12px;
    align-items: center;
    font-size: 13px;

    label {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
  }
  .color-input {
    width: 28px;
    height: 28px;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: @form-radius;
  }
</style>
