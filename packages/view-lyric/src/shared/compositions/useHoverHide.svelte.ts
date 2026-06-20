import { onMount } from 'svelte'

import { useSettingValue } from '@/modules/setting/reactive.svelte'
import { settingState } from '@/modules/setting/store/state'
import { mouseEnterLeave } from '@/shared/ipc/app'
import { mouseLeaveEvent } from '@/shared/ipc/app/event'

export default () => {
  let isMouseEnter = $state(false)
  const isHoverHideSetting = useSettingValue('desktopLyric.isHoverHide')

  let isHoverHide = $derived(isHoverHideSetting.val && isMouseEnter)

  const handleMouseMove = () => {
    handleMouseEnter()
  }
  const handleMouseEnter = () => {
    if (isMouseEnter || !settingState.setting['desktopLyric.isLock']) return
    isMouseEnter = true
    void mouseEnterLeave(true)
  }
  const handleMouseLeave = () => {
    if (!isMouseEnter) return
    isMouseEnter = false
    void mouseEnterLeave(false)
  }

  onMount(() => {
    document.body.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseenter', handleMouseEnter)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    const removeMouseEnterLeaveListener = mouseLeaveEvent.on(() => {
      isMouseEnter = false
    })
    return () => {
      removeMouseEnterLeaveListener()
      document.body.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseenter', handleMouseEnter)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  })

  return {
    get val() {
      return isHoverHide
    },
  }
}
