<script lang="ts">
  import { PIC_FILE_TYPES } from '@any-listen/common/constants'
  import { onMount } from 'svelte'

  import { showSimpleConfirmModal } from '@/components/apis/dialog'
  import Btn from '@/components/base/Btn.svelte'
  import Checkbox from '@/components/base/Checkbox.svelte'
  import { createThemeColors, colorToHex, hexToRgb } from '@/modules/theme/colors'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { getThemeImages, getThemeList, getThemeSetting, removeThemeImage, saveTheme, saveThemeImage } from '@/modules/theme/store/action'
  import { updateSetting } from '@/modules/setting/store/action'
  import { i18n, t } from '@/plugins/i18n'
  import { showOpenDialog } from '@/shared/ipc/app'
  import { themeChangedEvent, themeListChangedEvent } from '@/shared/ipc/theme/event'

  import TitleContent from '../components/TitleContent.svelte'

  const CUSTOM_THEME_ID = 'custom'
  const NONE_BACKGROUND_IMAGE = 'none'

  let sourceTheme = $state.raw<AnyListen.Theme | null>(null)
  let primaryColor = $state('#4f62d0')
  let fontColor = $state('#212121')
  let isDark = $state(false)
  let backgroundImage = $state(NONE_BACKGROUND_IMAGE)
  let themeImages = $state.raw<AnyListen.ThemeImage[]>([])
  let isUploadingImage = $state(false)
  let hasCustomTheme = $state(false)
  let themeIdSetting = useSettingValue('theme.id')
  let isCustomSelected = $derived(themeIdSetting.val == CUSTOM_THEME_ID)
  let isSavingTheme = false
  let shouldSaveAgain = false
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const unwrapCssUrl = (value: string) => {
    const match = /^url\((['"]?)(.*?)\1\)$/.exec(value)
    return match?.[2] ?? value
  }

  const getBackgroundImageKey = (value: string) => {
    const imagePath = unwrapCssUrl(value || NONE_BACKGROUND_IMAGE)
    if (!imagePath || imagePath == NONE_BACKGROUND_IMAGE) return NONE_BACKGROUND_IMAGE
    if (imagePath.startsWith('./theme_images/')) return `url(${imagePath})`
    const normalizedPath = imagePath.replaceAll('\\', '/')
    const fileName = normalizedPath.split('/').pop() || normalizedPath
    try {
      return decodeURIComponent(fileName)
    } catch {
      return fileName
    }
  }

  let selectedBackgroundKey = $derived(getBackgroundImageKey(backgroundImage))

  const isThemeImageSelected = (image: AnyListen.ThemeImage) => {
    return selectedBackgroundKey == getBackgroundImageKey(image.value)
  }

  const selectBackgroundImage = (value: string) => {
    backgroundImage = value
    queueSave()
  }

  const setForm = (theme: AnyListen.Theme | null) => {
    sourceTheme = theme
    primaryColor = colorToHex(theme?.config.themeColors['--color-primary'] ?? '', '#4f62d0')
    fontColor = colorToHex(theme?.config.themeColors['--color-1000'] ?? '', '#212121')
    isDark = theme?.isDark ?? false
    backgroundImage = theme?.config.extInfo['--background-image'] ?? NONE_BACKGROUND_IMAGE
  }

  const load = async () => {
    const [list, setting, images] = await Promise.all([getThemeList(), getThemeSetting(), getThemeImages()])
    const customTheme = list.userThemes.find((theme) => theme.id == CUSTOM_THEME_ID)
    themeImages = images
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
          '--background-image': backgroundImage,
        },
      },
    } satisfies AnyListen.Theme
  }

  const uploadThemeImage = async () => {
    const result = await showOpenDialog({
      title: i18n.t('theme_edit_modal__select_bg_file'),
      buttonLabel: i18n.t('theme_edit_modal__bg_image_upload'),
      properties: ['openFile'],
      filters: [
        {
          name: i18n.t('theme_edit_modal__bg_image'),
          extensions: [...PIC_FILE_TYPES],
        },
      ],
    })
    if (result.canceled || !result.filePaths.length) return

    isUploadingImage = true
    try {
      const image = await saveThemeImage(result.filePaths[0])
      themeImages = [...themeImages.filter((item) => item.id != image.id), image]
      selectBackgroundImage(image.value)
    } finally {
      isUploadingImage = false
    }
  }

  const deleteThemeImage = async (image: AnyListen.ThemeImage) => {
    if (!image.canDelete) return
    const confirm = await showSimpleConfirmModal(i18n.t('theme_edit_modal__bg_image_delete_tip'))
    if (!confirm) return

    await removeThemeImage(image.name)
    themeImages = themeImages.filter((item) => item.id != image.id)
    if (isThemeImageSelected(image)) selectBackgroundImage(NONE_BACKGROUND_IMAGE)
  }

  const saveCurrentTheme = async () => {
    if (themeIdSetting.val != CUSTOM_THEME_ID) return
    if (isSavingTheme) {
      shouldSaveAgain = true
      return
    }
    const theme = createTheme()
    if (!theme) return

    isSavingTheme = true
    try {
      await saveTheme(theme)
      const setting: Partial<AnyListen.AppSetting> = {
        'theme.id': CUSTOM_THEME_ID,
      }
      setting[theme.isDark ? 'theme.darkId' : 'theme.lightId'] = CUSTOM_THEME_ID
      await updateSetting(setting)
      sourceTheme = theme
      hasCustomTheme = true
    } finally {
      isSavingTheme = false
    }
    if (!shouldSaveAgain) return
    shouldSaveAgain = false
    queueSave()
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

  const loadRemoteTheme = () => {
    if (isSavingTheme || saveTimer) return
    void load()
  }

  onMount(() => {
    void load()
    const unregisterThemeChanged = themeChangedEvent.on(loadRemoteTheme)
    const unregisterThemeListChanged = themeListChangedEvent.on(loadRemoteTheme)
    return () => {
      if (saveTimer) clearTimeout(saveTimer)
      shouldSaveAgain = false
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
      <div class="image-section">
        <div class="section-header">
          <span class="section-title">{$t('theme_edit_modal__bg_image')}</span>
          <Btn min icontext loading={isUploadingImage} onclick={uploadThemeImage}>
            <svg version="1.1" viewBox="0 0 512 512">
              <use xlink:href="#icon-add-2" />
            </svg>
            <span>{$t('theme_edit_modal__bg_image_upload')}</span>
          </Btn>
        </div>
        <div class="image-grid">
          <div class:active={selectedBackgroundKey == NONE_BACKGROUND_IMAGE} class="image-card">
            <button
              type="button"
              class="image-select none-image"
              aria-label={$t('theme_edit_modal__bg_image_none')}
              onclick={() => {
                selectBackgroundImage(NONE_BACKGROUND_IMAGE)
              }}
            >
              <svg version="1.1" viewBox="0 0 512 512">
                <use xlink:href="#icon-eraser" />
              </svg>
              <span>{$t('theme_edit_modal__bg_image_none')}</span>
            </button>
          </div>
          {#each themeImages as image (image.id)}
            <div class:active={isThemeImageSelected(image)} class="image-card">
              <button
                type="button"
                class="image-select"
                aria-label={image.name}
                onclick={() => {
                  selectBackgroundImage(image.value)
                }}
              >
                <img src={image.url} alt={image.name} />
                {#if image.source == 'preset'}
                  <span class="image-badge">{$t('theme_edit_modal__bg_image_preset')}</span>
                {/if}
              </button>
              {#if image.canDelete}
                <button
                  type="button"
                  class="delete-image"
                  aria-label={$t('theme_edit_modal__remove')}
                  onclick={(event) => {
                    event.stopPropagation()
                    void deleteThemeImage(image)
                  }}
                >
                  <svg version="1.1" viewBox="0 0 212.982 212.982">
                    <use xlink:href="#icon-delete" />
                  </svg>
                </button>
              {/if}
            </div>
          {/each}
        </div>
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
  .image-section {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
  }
  .section-header {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;

    :global(svg) {
      width: 14px;
      height: 14px;
    }
  }
  .section-title {
    font-size: 13px;
    color: var(--color-font-label);
  }
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 8px;
  }
  .image-card {
    position: relative;
    height: 76px;
    overflow: hidden;
    background-color: var(--color-primary-light-200-alpha-900);
    border: 1px solid transparent;
    border-radius: @radius-border;
    transition: @transition-normal;
    transition-property: border-color, box-shadow, opacity;

    &.active {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-alpha-800);
    }

    &:hover {
      .delete-image {
        opacity: 1;
      }
    }
  }
  .image-select {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: hidden;
    color: var(--color-font);
    cursor: pointer;
    background: transparent;
    border: 0;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .none-image {
    display: flex;
    flex-flow: column nowrap;
    gap: 4px;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--color-font-label);

    svg {
      width: 22px;
      height: 22px;
    }
  }
  .image-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    max-width: calc(100% - 8px);
    padding: 2px 4px;
    overflow: hidden;
    font-size: 10px;
    line-height: 1.2;
    color: var(--color-primary-light-1000);
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--color-primary-alpha-300);
    border-radius: 4px;
  }
  .delete-image {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 5px;
    color: var(--color-000);
    cursor: pointer;
    background: rgb(0 0 0 / 45%);
    border: 0;
    border-radius: 50%;
    opacity: 0;
    transition: @transition-normal;
    transition-property: background-color, opacity;

    &:hover {
      background: rgb(0 0 0 / 65%);
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }
</style>
