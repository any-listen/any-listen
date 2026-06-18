import { createClickHandle } from '@any-listen/web'

import { playIndex } from '@/modules/player/actions'

export type TabType = 'queue' | 'history'

export const musicClick = createClickHandle<[index: number]>(
  () => {},
  (index) => {
    playIndex(index)
  }
)
