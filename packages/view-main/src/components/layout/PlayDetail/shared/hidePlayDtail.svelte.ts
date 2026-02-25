import { createClickHandle } from '@any-listen/web'

import { setShowPlayDetail } from '@/modules/playDetail/store/commit'

export const hidePlayDtail = (dom: HTMLElement) => {
  const handleClick = createClickHandle(
    () => {},
    () => {
      setShowPlayDetail(false)
    }
  )
  const handleCtxMenu = () => {
    handleClick()
  }

  dom.addEventListener('contextmenu', handleCtxMenu)

  return () => {
    dom.removeEventListener('contextmenu', handleCtxMenu)
  }
}
