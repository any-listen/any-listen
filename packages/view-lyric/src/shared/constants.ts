import { LIST_IDS } from '@any-listen/common/constants'

export const GENERAL_LIST_TYPES: Array<AnyListen.List.MyListInfo['type']> = ['default', 'general']

export const LIST_PIC_ICON = {
  [LIST_IDS.LOVE]: 'music_heart',
  [LIST_IDS.DEFAULT]: 'play',
  [LIST_IDS.LAST_PLAYED]: 'time_machine',
} as const

export const MODAL_CLASSNAMES = {
  modal: 'show-modal',
  fullscreenModal: 'show-fullscreen-modal',
} as const
