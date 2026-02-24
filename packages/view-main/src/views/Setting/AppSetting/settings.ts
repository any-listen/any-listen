import { showNotify } from '@/components/apis/notify'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { getThemeList } from '@/modules/theme/store/action'
import { i18n, langList, type Message } from '@/plugins/i18n'
import { windowSizeList } from '@any-listen/common/constants'
import type { Component } from 'svelte'
import About from './About.svelte'
import DislikedList from './DislikedList.svelte'
import ExtensionGHMirrorHosts from './ExtensionGHMirrorHosts.svelte'
import Font from './Font.svelte'
import LoginDevices from './LoginDevices.svelte'
import MusicCache from './MusicCache.svelte'
import Network from './Network.svelte'
import ResourceCache from './ResourceCache.svelte'
import Update from './Update.svelte'

interface SettingBase<T = unknown> {
  field: keyof AnyListen.AppSetting
  name: keyof Message
  description?: keyof Message
  onChnaged?: (value: T) => void
  onUpdate?: (value: T) => void
}
export interface EnumItem {
  name: keyof Message
  value: string | number
}
export interface SettingListComponentItem {
  name: keyof Message
  description?: keyof Message
  type: 'component'
  component: Component
}
interface SettingInput extends SettingBase<string> {
  type: 'input'
  textarea?: boolean
}
interface SettingBoolean extends SettingBase<boolean> {
  type: 'boolean'
}
interface SettingRadio extends SettingBase<EnumItem['value']> {
  type: 'radio'
  asyncEnum?: () => Promise<EnumItem[]>
  enum?: EnumItem[]
}
interface SettingSelection extends SettingBase<EnumItem['value']> {
  type: 'selection'
  enum: EnumItem[]
}
export type SettingListCommonItem = SettingInput | SettingBoolean | SettingSelection | SettingRadio
export type SettingListItem = SettingListCommonItem | SettingListComponentItem

export interface SettingListSection {
  id: string
  name: keyof Message
  list: Array<SettingListItem | null>
}
export const settings: SettingListSection[] = [
  {
    id: 'basic',
    name: 'settings__basic',
    list: [
      import.meta.env.VITE_IS_DESKTOP
        ? {
            field: 'tray.enable',
            name: 'settings__basic_tray',
            type: 'boolean',
          }
        : null,
      {
        field: 'common.isShowAnimation',
        name: 'settings__basic_animate',
        type: 'boolean',
      },
      {
        field: 'theme.id',
        name: 'settings__basic_theme',
        type: 'radio',
        async asyncEnum() {
          // t('settings__basic_window_size_tip')
          const themeList = (await getThemeList()).themes.map((t) => ({ name: `theme_${t.id}` as keyof Message, value: t.id }))
          // console.log(themeList)
          return [...themeList, { name: 'theme_auto', value: 'auto' }]
        },
        onUpdate(value) {
          if (value === 'auto') {
            void updateSetting({
              'theme.id': value,
              'theme.lightId': settingState.setting['theme.id'] === 'black' ? undefined : settingState.setting['theme.id'],
            })
          } else {
            void updateSetting({
              'theme.id': value as string,
              'theme.lightId': value === 'black' ? undefined : (value as string),
            })
          }
        },
      },
      {
        field: 'common.windowSizeId',
        name: 'settings__basic_window_size',
        type: 'radio',
        enum: (import.meta.env.VITE_IS_WEB ? windowSizeList.slice(0, 4) : windowSizeList).map((w) => ({
          value: w.id,
          name: `settings__basic_window_size_${w.name}` as keyof Message,
        })),
        onChnaged: import.meta.env.VITE_IS_WEB
          ? () => {
              if (window.os === 'mac') {
                showNotify(i18n.t('settings__basic_window_size_tip_mac'))
              } else {
                showNotify(i18n.t('settings__basic_window_size_tip'))
              }
            }
          : undefined,
      },
      {
        name: 'settings.basic.font',
        type: 'component',
        component: Font,
      },
      {
        field: 'common.langId',
        name: 'settings__basic_lang',
        type: 'radio',
        enum: langList.map((l) => ({ value: l.locale, name: l.name as keyof Message })),
      },
      // t('settings.basic.play_bar_style_center_control_full_btn')
      {
        field: 'common.playBarProgressStyle',
        name: 'settings.basic.play_bar_style',
        type: 'radio',
        enum: [
          { value: 'mini', name: 'settings.basic.play_bar_style_mini' },
          { value: 'middle', name: 'settings.basic.play_bar_style_middle' },
          { value: 'full', name: 'settings.basic.play_bar_style_full' },
          { value: 'centerControl', name: 'settings.basic.play_bar_style_center_control_btn' },
          { value: 'centerControlMiddle', name: 'settings.basic.play_bar_style_center_control_middle_btn' },
          { value: 'centerControlFull', name: 'settings.basic.play_bar_style_center_control_full_btn' },
        ] satisfies Array<{ value: AnyListen.AppSetting['common.playBarProgressStyle']; name: keyof Message }>,
      },
    ],
  },
  {
    id: 'player',
    name: 'settings__player',
    list: [
      import.meta.env.VITE_IS_DESKTOP
        ? {
            field: 'player.startupAutoPlay',
            name: 'settings__play_startup_auto_play',
            type: 'boolean',
          }
        : null,
      {
        field: 'player.isSavePlayTime',
        name: 'settings__play_save_play_time',
        type: 'boolean',
      },
      {
        field: 'player.isShowLyricTranslation',
        name: 'settings.player.lyric_transition',
        type: 'boolean',
      },
      {
        field: 'player.isShowLyricRoma',
        name: 'settings.player.lyric_roma',
        type: 'boolean',
      },
      {
        field: 'player.isSwapLyricTranslationAndRoma',
        name: 'settings.player.lyric_trans_roma_swap',
        type: 'boolean',
      },
      // t('settings.player.media_device_changed_pause_play')
      {
        field: 'player.isPlayAwlrc',
        name: 'settings.player.play_awlrc',
        type: 'boolean',
      },
      {
        field: 'player.isShowTitleLyric',
        name: 'settings.player.title_lyric',
        type: 'boolean',
      },
      {
        field: 'player.isShowMediaSessionLyric',
        name: 'settings.player.media_session_lyric',
        type: 'boolean',
      },
      import.meta.env.VITE_IS_DESKTOP
        ? {
            field: 'player.isMediaDeviceChangedPausePlay',
            name: 'settings.player.media_device_changed_pause_play',
            type: 'boolean',
          }
        : null,
      import.meta.env.VITE_IS_MAC
        ? {
            field: 'player.isShowStatusBarLyric',
            name: 'settings.player.status_bar_lyric',
            type: 'boolean',
          }
        : null,
    ],
  },
  {
    id: 'playDetail',
    name: 'settings.play_detail',
    list: [
      // t('settings.play_detail.cover_style_square')
      {
        field: 'playDetail.isDynamicBackground',
        name: 'settings.play_detail.dynamic_background',
        type: 'boolean',
      },
      {
        field: 'playDetail.isDelayScroll',
        name: 'settings.play_detail.delay_scroll',
        type: 'boolean',
      },
      {
        field: 'playDetail.isZoomActiveLrc',
        name: 'settings.play_detail.zoom_active_lrc',
        type: 'boolean',
      },
      {
        field: 'playDetail.style.fontWeight',
        name: 'settings.play_detail.style_font_weight',
        type: 'boolean',
      },
      {
        field: 'playDetail.coverStyle',
        name: 'settings.play_detail.cover_style',
        type: 'radio',
        enum: [
          { value: 'cd', name: 'settings.play_detail.cover_style_cd' },
          { value: 'square', name: 'settings.play_detail.cover_style_square' },
        ] satisfies Array<{ value: AnyListen.AppSetting['playDetail.coverStyle']; name: keyof Message }>,
      },
      {
        field: 'playDetail.style.align',
        name: 'settings.play_detail.style_align',
        type: 'radio',
        enum: [
          { value: 'left', name: 'settings.play_detail.style_align_left' },
          { value: 'center', name: 'settings.play_detail.style_align_center' },
          { value: 'right', name: 'settings.play_detail.style_align_right' },
        ] satisfies Array<{ value: AnyListen.AppSetting['playDetail.style.align']; name: keyof Message }>,
      },
    ],
  },
  {
    id: 'extension',
    // t('settings.extension')
    name: 'settings.extension',
    list: [
      {
        name: 'settings.extension.gh_mirror_hosts',
        type: 'component',
        component: ExtensionGHMirrorHosts,
      },
    ],
  },
  {
    id: 'network',
    // t('settings.network.proxy')
    name: 'settings.network',
    list: [
      {
        name: 'settings.network.proxy',
        type: 'component',
        component: Network,
      },
    ],
  },
  {
    id: 'other',
    name: 'settings.other',
    list: [
      import.meta.env.VITE_IS_DESKTOP && import.meta.env.VITE_IS_MAC
        ? null
        : {
            field: 'common.transparentWindow',
            name: 'settings.common.transparent_window',
            description: 'settings.common.transparent_window_desc',
            type: 'boolean',
          },
      // t('settings.common.enable_trash_desc')
      import.meta.env.VITE_IS_DESKTOP
        ? {
            field: 'common.enableTrash',
            name: 'settings.common.enable_trash',
            description: 'settings.common.enable_trash_desc',
            type: 'boolean',
          }
        : null,
      import.meta.env.VITE_IS_DESKTOP
        ? {
            field: 'tray.themeId',
            name: 'settings.tray.theme_id',
            type: 'radio',
            enum: [
              { value: 0, name: 'settings.tray.theme_id_light' },
              { value: 2, name: 'settings.tray.theme_id_dark' },
              { value: 1, name: 'settings.tray.theme_id_origin' },
            ] satisfies Array<{ value: AnyListen.AppSetting['tray.themeId']; name: keyof Message }>,
          }
        : null,
      {
        name: 'settings.other.resource_cache',
        type: 'component',
        component: ResourceCache,
      },
      {
        name: 'settings.other.music_cache',
        type: 'component',
        component: MusicCache,
      },
      {
        name: 'settings.other.dislike_list',
        type: 'component',
        component: DislikedList,
      },
    ],
  },
  {
    id: 'update',
    name: 'settings.update',
    list: [
      // t('settings.update.try_auto_update')
      {
        field: 'common.tryAutoUpdate',
        name: 'settings.update.try_auto_update',
        description: 'settings.update.try_auto_update_desc',
        type: 'boolean',
      },
      {
        field: 'common.allowPreRelease',
        name: 'settings.update.allow_pre_release',
        description: 'settings.update.allow_pre_release_desc',
        type: 'boolean',
      },
      {
        field: 'common.showChangeLog',
        name: 'settings.update.show_change_log',
        description: 'settings.update.show_change_log_desc',
        type: 'boolean',
      },
      {
        name: 'settings.update',
        type: 'component',
        component: Update,
      },
    ],
  },
  {
    id: 'about',
    name: 'settings__about',
    list: [
      {
        name: 'settings__about',
        type: 'component',
        component: About,
      },
    ],
  },
]

if (import.meta.env.VITE_IS_WEB) {
  settings.splice(settings.length - 3, 0, {
    id: 'security',
    name: 'settings__security',
    list: [
      {
        name: 'settings__security_login_devices',
        type: 'component',
        component: LoginDevices,
      },
    ],
  })
}
