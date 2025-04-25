import { app, Menu } from 'electron'
import { isMac } from '@/shared/utils'
import { actions } from '@/actions'
import { i18n } from '@/i18n'

// TODO
export const initAppMenu = () => {
  if (isMac) {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.getName(),
        submenu: [
          { label: i18n.t('main_app_menu__about_app'), role: 'about' },
          { type: 'separator' },
          { label: i18n.t('main_app_menu__hide'), role: 'hide' },
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
        label: i18n.t('main_app_menu__window'),
        role: 'window',
        submenu: [
          { label: i18n.t('window__minimize'), role: 'minimize', accelerator: 'Command+W' },
          { label: i18n.t('window__close'), role: 'close' },
        ],
      },
      {
        label: i18n.t('main_app_menu__edit'),
        submenu: [
          { label: i18n.t('main_app_menu__undo'), accelerator: 'Command+Z', role: 'undo' },
          { label: i18n.t('main_app_menu__redo'), accelerator: 'Shift+Command+Z', role: 'redo' },
          { type: 'separator' },
          { label: i18n.t('main_app_menu__cut'), accelerator: 'Command+X', role: 'cut' },
          { label: i18n.t('main_app_menu__copy'), accelerator: 'Command+C', role: 'copy' },
          { label: i18n.t('main_app_menu__paste'), accelerator: 'Command+V', role: 'paste' },
          { label: i18n.t('main_app_menu__select_all'), accelerator: 'Command+A', role: 'selectAll' },
        ],
      },
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }
}
