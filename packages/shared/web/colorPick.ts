import { throttle } from '@any-listen/common/utils'
import Pickr from '@simonwep/pickr'

// @ts-ignore
import '@simonwep/pickr/dist/themes/classic.min.css'

export interface PickrTools {
  pickr: Pickr | null
  create: (options: {
    dom: HTMLElement
    color: string
    swatches: string[] | null
    onChange: (color: string) => void
    onReset?: () => void
    'i18n.toggle': string
    'i18n.last-color': string
    'i18n.save': string
    'i18n.cancel': string
  }) => PickrTools
  destroy: () => void
  setColor: (color: string) => void
}

export const pickrTools: PickrTools = {
  pickr: null,
  create(options) {
    const pickrTools: PickrTools = Object.create(this)

    pickrTools.pickr = Pickr.create({
      el: options.dom,
      default: options.color,
      theme: 'classic', // or 'monolith', or 'nano'
      defaultRepresentation: 'RGBA',
      autoReposition: false,
      closeWithKey: '',
      appClass: 'color-picker',
      comparison: false,
      useAsButton: true,

      swatches: options.swatches,

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          cancel: true,
          // save: true,
        },
      },

      i18n: {
        // Strings visible in the UI
        'ui:dialog': ' ',
        'btn:toggle': options['i18n.toggle'],
        'btn:swatch': ' ',
        'btn:last-color': options['i18n.last-color'],
        'btn:save': options['i18n.save'],
        'btn:cancel': options['i18n.cancel'],

        // Strings used for aria-labels
        'aria:btn:save': ' ',
        'aria:btn:cancel': ' ',
        'aria:input': ' ',
        'aria:palette': ' ',
        'aria:hue': '',
        'aria:opacity': ' ',
      },
    })

    let swatchselectColor: any

    const throttleChange = throttle((color: any, source: string) => {
      if (source == 'swatch' && swatchselectColor !== color) return
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      options.onChange(color.toRGBA().toString())
    })
    pickrTools.pickr
      .on('swatchselect', (color: any) => {
        swatchselectColor = color
      })
      .on('change', throttleChange)
      .on('cancel', () => {
        console.log('cancel')
        options.onChange(options.color)
        options.onReset?.()
      })

    return pickrTools
  },
  destroy() {
    if (!this.pickr) return
    this.pickr.destroyAndRemove()
    this.pickr = null
  },
  setColor(color) {
    this.pickr?.setColor(color)
  },
}
