import { type PickrTools, pickrTools } from '@any-listen/web/colorPick'

import { i18n } from '@/plugins/i18n'
export default (color: string, swatches: string[] | null, onChange: (color: string) => void, onReset?: () => void) => {
  let tools: PickrTools | null = null
  return {
    setColor(color: string) {
      tools?.setColor(color)
    },
    attach(dom: HTMLElement) {
      tools = pickrTools.create({
        dom,
        color,
        swatches,
        onChange,
        onReset,
        'i18n.last-color': i18n.t('theme_edit_modal__pick_last_color'),
        'i18n.cancel': i18n.t('theme_edit_modal__pick_cancel'),
        'i18n.save': i18n.t('theme_edit_modal__pick_save'),
        'i18n.toggle': i18n.t('theme_edit_modal__pick_color'),
      })

      return () => {
        tools?.destroy()
        tools = null
      }
    },
  }
}
