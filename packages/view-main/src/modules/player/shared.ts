import { playerEvent } from './store/event'

export const onPlayerCreated = (handler: () => void) => {
  return playerEvent.on('created', handler)
}

export const onActivePlayProgressTransition = (handler: () => void) => {
  return playerEvent.on('activePlayProgressTransition', handler)
}
