import { appEvent } from '@/modules/app/store/event'
import { keyboardEvent } from '@/modules/hotkey/keyboard'
import type Sortable from 'sortablejs'

let loadPromise: Promise<typeof Sortable> | null = null
const handleLoadSortable = async () => {
  const { default: Sortable, AutoScroll } = await import('sortablejs')
  Sortable.mount(new AutoScroll())
  return Sortable
}
const loadSortable = async () => {
  loadPromise ||= handleLoadSortable()
  return loadPromise
}

export type OnUpdate = (parentId: string | undefined, id: string, toTargetId: string | undefined, position: number) => void

export const sortable = (options: { onupdate: OnUpdate; filter?: string; activeElement?: string }) => {
  const { onupdate, filter, activeElement: active } = options
  let unmounted = false
  return (dom: HTMLElement) => {
    let activeElement = active ? document.querySelector(`.${active}`)! : null
    // console.log(dom)
    let sortable: Sortable | null = null
    let isEnabled = false

    const enableSortable = async () => {
      if (!sortable) {
        const Sortable = await loadSortable()
        if (unmounted) return
        // eslint-disable-next-line require-atomic-updates
        sortable = Sortable.create(dom, {
          animation: 150,
          disabled: true,
          // forceFallback: false,
          // group: 'nested',
          // fallbackOnBody: true,
          // swapThreshold: 0.65,
          draggable: '.draggable-item',
          dragClass: '.draggable-item',
          filter: filter ? `.${filter}` : undefined,
          onStart() {
            // console.log('onStart')
            appEvent.drag(false)
          },
          onMove(event) {
            return filter ? !event.related.classList.contains(filter) : true
          },
          onEnd(event) {
            appEvent.drag(true)
            // console.log(event)
            const parentId = event.from.dataset.id
            const toId = event.to.dataset.id
            const id = event.item.dataset.id
            const oldIndex = event.oldIndex
            const newIndex = event.newIndex
            if (!id || (parentId == toId && oldIndex == newIndex) || newIndex == null) return
            if (event.to !== event.from) {
              event.to.removeChild(event.item)
              event.from.appendChild(event.item)
            }
            queueMicrotask(() => {
              console.log(parentId, id, toId, newIndex)
              onupdate(parentId, id, toId, newIndex)
            })
          },
        })
      }
      if (!isEnabled) return
      sortable.option('disabled', false)
      console.log('sortable enabled')
    }

    const unsub = keyboardEvent.on('mod_down', (evt) => {
      if (evt.inputing || evt.event?.repeat) return
      if (!(!activeElement || activeElement === document.activeElement || activeElement.contains(document.activeElement))) return
      isEnabled = true
      void enableSortable()
    })
    const unsub2 = keyboardEvent.on('mod_up', () => {
      if (!isEnabled) return
      isEnabled = false
      sortable?.option('disabled', true)
    })

    return () => {
      unmounted = true
      unsub()
      unsub2()
      sortable?.destroy()
      sortable = null
    }
  }
}
