import { createClickHandle } from '@any-listen/web'

import { playIndex } from '@/modules/player/actions'
import { removePlayListMusic } from '@/modules/player/store/actions'

export type TabType = 'queue' | 'history'

export const musicClick = createClickHandle<[index: number]>(
  () => {},
  (index) => {
    playIndex(index)
  }
)

export const removeMusic = async (id: string) => {
  await removePlayListMusic([id])
}

export { playIndex }
