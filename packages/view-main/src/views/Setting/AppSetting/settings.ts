import { getThemeList } from '@/modules/theme/store/action'
import { langList, type Message } from '@/plugins/i18n'
import { windowSizeList } from '@any-listen/common/constants'
import type { Component } from 'svelte'
import About from './About.svelte'
import LoginDevices from './LoginDevices.svelte'
import Update from './Update.svelte'

interface SettingBase {
  field: keyof AnyListen.AppSetting
  name: keyof Message
  description?: keyof Message
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
interface SettingInput extends SettingBase {
  type: 'input'
  textarea?: boolean
}
interface SettingBoolean extends SettingBase {
  type: 'boolean'
}
interface SettingRadio extends SettingBase {
  type: 'radio'
  asyncList?: () => Promise<EnumItem[]>
  enum?: EnumItem[]
}
interface SettingSelection extends SettingBase {
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
        async asyncList() {
          // t('settings__about')
          const themeList = await getThemeList()
          // console.log(themeList)
          return themeList.themes.map((t) => ({ name: `theme_${t.id}` as keyof Message, value: t.id }))
        },
      },
      {
        field: 'common.windowSizeId',
        name: 'settings__basic_window_size',
        type: 'radio',
        enum: windowSizeList.map((w) => ({ value: w.id, name: `settings__basic_window_size_${w.name}` as keyof Message })),
      },
      {
        field: 'common.fontSize',
        name: 'settings__basic_font_size',
        type: 'radio',
        enum: [
          { value: 14, name: 'settings__basic_font_size_14px' },
          { value: 15, name: 'settings__basic_font_size_15px' },
          { value: 16, name: 'settings__basic_font_size_16px' },
          { value: 17, name: 'settings__basic_font_size_17px' },
          { value: 18, name: 'settings__basic_font_size_18px' },
          { value: 19, name: 'settings__basic_font_size_19px' },
        ],
      },
      {
        field: 'common.langId',
        name: 'settings__basic_lang',
        type: 'radio',
        enum: langList.map((l) => ({ value: l.locale, name: l.name as keyof Message })),
      },
      // {
      //   field: 'common.controlBtnPosition',
      //   name: 'settings__basic_control_btn_position',
      //   type: 'radio',
      //   enum: [
      //     { value: 'left', name: 'settings__basic_control_btn_position_left' },
      //     { value: 'right', name: 'settings__basic_control_btn_position_right' },
      //   ],
      // },
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
    ],
  },
  {
    id: 'update',
    name: 'settings__update',
    list: [
      import.meta.env.VITE_IS_DESKTOP
        ? {
            field: 'common.tryAutoUpdate',
            name: 'settings__update_try_auto_update',
            type: 'boolean',
          }
        : null,
      {
        field: 'common.allowPreRelease',
        name: 'settings__update_allow_pre_release',
        description: 'settings__update_allow_pre_release_desc',
        type: 'boolean',
      },
      {
        field: 'common.showChangeLog',
        name: 'settings__update_show_change_log',
        description: 'settings__update_show_change_log_desc',
        type: 'boolean',
      },
      {
        name: 'settings__update',
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
  settings.splice(settings.length - 2, 0, {
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
