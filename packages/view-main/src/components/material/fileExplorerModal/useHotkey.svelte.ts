import { keyboardEvent } from '@/modules/hotkey/keyboard'
import { onMount } from 'svelte'

export const useHotkey = ({ getListEl, selectAll }: { getListEl: () => HTMLElement | undefined; selectAll: () => void }) => {
  let isShiftDown = $state(false)
  let isModDown = false

  onMount(() => {
    const unsub = keyboardEvent.on('mod+a_down', (event) => {
      if (!event.event || event.event.repeat || event.inputing || !getListEl()?.contains(document.activeElement)) return
      event.event.preventDefault()
      selectAll()
    })
    const unsub2 = keyboardEvent.on('shift_down', (event) => {
      if (event.event?.repeat) return
      isShiftDown ||= true
      isShiftDown ||= true
    })
    const unsub3 = keyboardEvent.on('shift_up', (event) => {
      if (event.event?.repeat) return
      isShiftDown &&= false
      isShiftDown ||= false
    })
    const unsub4 = keyboardEvent.on('mod_down', (event) => {
      isModDown ||= true
    })
    const unsub5 = keyboardEvent.on('mod_up', (event) => {
      isModDown &&= false
    })
    return () => {
      unsub()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
    }
  })
  return {
    get isShiftDown() {
      return isShiftDown
    },
    get isModDown() {
      return isModDown
    },
    isKeyMultiKeyDown() {
      return isShiftDown || isModDown
    },
  }
}
