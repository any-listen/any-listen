import { dislikeListEvent } from './store/event'
import { dislikeListState } from './store/state'

export const useDislikeListRuleCount = () => {
  let val = $state.raw(dislikeListState.count)

  $effect(() => {
    const handleUpdate = () => {
      val = dislikeListState.count
    }
    handleUpdate()
    dislikeListEvent.on('updated', handleUpdate)

    return function stop() {
      dislikeListEvent.off('updated', handleUpdate)
    }
  })

  return {
    get val() {
      return val
    },
  }
}
