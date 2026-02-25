import { readable } from 'svelte/store'

import { playDetailEvent } from './store/event'
import { playDetailState } from './store/state'

export const isShowPlayDetail = readable(playDetailState.isShowPlayDetail, (set) => {
  return playDetailEvent.on('visible', set)
})
