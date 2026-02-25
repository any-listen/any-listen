//! 更新默认主题配置后，需要执行 npm run build:theme 重新构建index.json

import fs from 'node:fs'
import path from 'node:path'

import { createThemeColors } from './utils.js'

const defaultThemes = [
  {
    id: 'green',
    name: '绿意盎然',
    isDark: false,
    config: {
      primary: 'rgb(77, 175, 124)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#4baed5',
      '--color-badge-tertiary': '#e7aa36',
    },
  },
  {
    id: 'blue',
    name: '蓝田生玉',
    isDark: false,
    config: {
      primary: 'rgb(52, 152, 219)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#5cbf9b',
      '--color-badge-tertiary': '#5cbf9b',
    },
  },
  {
    id: 'blue_plus',
    name: '蛋雅深蓝',
    isDark: false,
    config: {
      primary: 'rgb(77, 131, 175)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': 'rgba(66.6, 150.7, 171, 1)',
      '--color-badge-tertiary': 'rgba(54, 196, 231, 1)',
    },
  },
  {
    id: 'orange',
    name: '橙黄橘绿',
    isDark: false,
    config: {
      primary: 'rgb(245, 171, 53)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#9ed458',
      '--color-badge-tertiary': '#9ed458',
    },
  },
  {
    id: 'red',
    name: '热情似火',
    isDark: false,
    config: {
      primary: 'rgb(214, 69, 65)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#dfbb6b',
      '--color-badge-tertiary': '#dfbb6b',
    },
  },
  {
    id: 'pink',
    name: '粉装玉琢',
    isDark: false,
    config: {
      primary: 'rgb(241, 130, 141)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#f5b684',
      '--color-badge-tertiary': '#f5b684',
    },
  },
  {
    id: 'purple',
    name: '重斤球紫',
    isDark: false,
    config: {
      // primary: 'rgb(155, 89, 182)',
      primary: 'rgb(121, 72, 187)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#e5a39f',
      '--color-badge-tertiary': '#e5a39f',
    },
  },
  {
    id: 'grey',
    name: '灰常美丽',
    isDark: false,
    config: {
      primary: 'rgb(108, 122, 137)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#b19b9f',
      '--color-badge-tertiary': '#b19b9f',
    },
  },
  {
    id: 'ming',
    name: '青出于黑',
    isDark: false,
    config: {
      primary: 'rgb(51, 110, 123)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#6376a2',
      '--color-badge-tertiary': '#6376a2',
    },
  },
  {
    id: 'blue2',
    name: '清热板蓝',
    isDark: false,
    config: {
      primary: 'rgb(79, 98, 208)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 1)',
      '--background-image': 'none',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#b080db',
      '--color-badge-tertiary': '#db80c4',
    },
  },
  {
    id: 'black',
    name: '黑灯瞎火',
    isDark: true,
    config: {
      primary: 'rgb(150, 150, 150)',
      font: 'rgb(229, 229, 229)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(0, 0, 0, 0.6)',
      '--background-image': 'url(./theme_images/landingMoon.png)',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '12px',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary-dark-200)',
      '--color-badge-secondary': 'var(--color-primary)',
      '--color-badge-tertiary': 'var(--color-primary-dark-300)',
    },
  },
  {
    id: 'mid_autumn',
    name: '月里嫦娥',
    isDark: false,
    config: {
      primary: 'rgb(74, 55, 82)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-500-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 0.98)',
      '--background-image': 'url(./theme_images/jqbg.jpg)',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': '#af9479',
      '--color-badge-tertiary': '#af9479',
    },
  },
  {
    id: 'naruto',
    name: '木叶之村',
    isDark: false,
    config: {
      primary: 'rgb(87, 144, 167)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-600-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 0.85)',
      '--background-image': 'url(./theme_images/myzcbg.jpg)',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': 'var(--color-primary)',
      '--color-badge-secondary': 'var(--color-primary-light-100)',
      '--color-badge-tertiary': 'var(--color-primary-light-100)',
    },
  },
  {
    id: 'china_ink',
    name: '近墨者黑',
    isDark: false,
    config: {
      primary: 'rgba(47, 47, 47, 1)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-800-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 0.8)',
      '--background-image': 'url(./theme_images/china_ink.jpg)',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '0',

      '--color-btn-hide': 'rgba(183, 212, 208, 1)',
      '--color-btn-min': 'rgba(200, 214, 183, 1)',
      '--color-btn-close': 'rgba(218, 195, 188, 1)',

      '--color-badge-primary': 'rgba(137, 70, 70, 1)',
      '--color-badge-secondary': 'rgba(67, 139, 65, 1)',
      '--color-badge-tertiary': 'rgba(132, 135, 65, 1)',
    },
  },
  {
    id: 'happy_new_year',
    name: '新年快乐',
    isDark: false,
    config: {
      primary: 'rgb(192, 57, 43)',
      font: 'rgb(33, 33, 33)',
      '--color-app-background': 'var(--color-primary-light-900-alpha-900)',
      '--color-main-background': 'rgba(255, 255, 255, 0.3)',
      '--background-image': 'url(./theme_images/xnkl.png)',
      '--background-image-position': 'center',
      '--background-image-size': 'cover',
      '--background-blur': '30px',

      '--color-btn-hide': '#3bc2b2',
      '--color-btn-min': '#85c43b',
      '--color-btn-close': '#fab4a0',

      '--color-badge-primary': '#7fb575',
      '--color-badge-secondary': '#dfbb6b',
      '--color-badge-tertiary': 'var(--color-primary-light-100)',
    },
  },
]

const themes = defaultThemes.map(({ config: { primary, font, ...extInfo }, ...themeInfo }) => ({
  ...themeInfo,
  isCustom: false,
  config: {
    themeColors: createThemeColors(primary, font, themeInfo.isDark),
    extInfo,
  },
}))

fs.writeFileSync(path.join(import.meta.dirname, 'index.json'), JSON.stringify(themes, null, 2))
