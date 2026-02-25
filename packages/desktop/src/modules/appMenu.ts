import { app, Menu } from 'electron'

import { actions } from '@/actions'
import { i18n, languageChangeEvent } from '@/i18n'
import { isMac } from '@/shared/utils'

export const initAppMenu = async () => {
  if (isMac) {
    const setMenu = () => {
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: app.getName(),
            submenu: [
              { label: i18n.t('main.app_menu.about_app'), role: 'about' },
              { type: 'separator' },
              { label: i18n.t('main.app_menu.hide'), role: 'hide' },
              { type: 'separator' },
              {
                label: i18n.t('quit'),
                accelerator: 'Command+Q',
                click() {
                  actions.exec('app.quit')
                },
              },
            ],
          },
          {
            label: i18n.t('main.app_menu.window'),
            role: 'window',
            submenu: [
              { label: i18n.t('main.app_menu.window_minimize'), role: 'minimize', accelerator: 'Command+W' },
              { label: i18n.t('main.app_menu.window_close'), role: 'close' },
            ],
          },
          {
            label: i18n.t('main.app_menu.edit'),
            submenu: [
              { label: i18n.t('main.app_menu.undo'), accelerator: 'Command+Z', role: 'undo' },
              { label: i18n.t('main.app_menu.redo'), accelerator: 'Shift+Command+Z', role: 'redo' },
              { type: 'separator' },
              { label: i18n.t('main.app_menu.cut'), accelerator: 'Command+X', role: 'cut' },
              { label: i18n.t('main.app_menu.copy'), accelerator: 'Command+C', role: 'copy' },
              { label: i18n.t('main.app_menu.paste'), accelerator: 'Command+V', role: 'paste' },
              { label: i18n.t('main.app_menu.select_all'), accelerator: 'Command+A', role: 'selectAll' },
            ],
          },
        ])
      )
    }
    setMenu()
    languageChangeEvent.on(setMenu)
  } else {
    Menu.setApplicationMenu(null)
  }
}
