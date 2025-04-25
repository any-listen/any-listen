// import fs from 'fs'
import { appState } from '@/app'
import { i18n } from '@/i18n'
import { windowSizeList } from '@any-listen/common/constants'
import { nativeImage } from 'electron'
import path from 'node:path'

export const getWindowSizeInfo = (windowSizeId: number | string) => {
  return windowSizeList.find((i) => i.id == windowSizeId) ?? windowSizeList[0]
}

const getIconPath = (name: string): Electron.NativeImage => {
  return nativeImage.createFromPath(path.join(appState.staticPath, 'images/taskbar', `${name}.png`))
}

export const createTaskBarButtons = (
  { empty = false, collect = false, play = false, next = true, prev = true }: AnyListen.TaskBarButtonFlags,
  onClick: (action: AnyListen.TaskBarButtonActions) => void
): Electron.ThumbarButton[] => {
  const buttons: Electron.ThumbarButton[] = [
    collect
      ? {
          icon: getIconPath('collected'),
          click() {
            onClick('unCollect')
          },
          tooltip: i18n.t('music_unlove'),
          flags: ['nobackground'],
        }
      : {
          icon: getIconPath('collect'),
          click() {
            onClick('collect')
          },
          tooltip: i18n.t('music_love'),
          flags: ['nobackground'],
        },
    {
      icon: getIconPath('prev'),
      click() {
        onClick('prev')
      },
      tooltip: i18n.t('player__skip_prev'),
      flags: prev ? ['nobackground'] : ['nobackground', 'disabled'],
    },
    play
      ? {
          icon: getIconPath('pause'),
          click() {
            onClick('pause')
          },
          tooltip: i18n.t('player__pause'),
          flags: ['nobackground'],
        }
      : {
          icon: getIconPath('play'),
          click() {
            onClick('play')
          },
          tooltip: i18n.t('player__play'),
          flags: ['nobackground'],
        },
    {
      icon: getIconPath('next'),
      click() {
        onClick('next')
      },
      tooltip: i18n.t('player__skip_next'),
      flags: next ? ['nobackground'] : ['nobackground', 'disabled'],
    },
  ]
  if (empty) {
    for (const button of buttons) {
      button.flags = ['nobackground', 'disabled']
    }
  }
  return buttons
}
