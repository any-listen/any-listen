import { mount, tick, unmount, type ComponentExports } from 'svelte'

// import type { Position } from './shared'
import { appEvent } from '@/modules/app/store/event'
import { debounce } from '@/shared'

import App from './App.svelte'

// export const showTooltips = (position: Position, message: string, autoCloseTime?: number) => {
//   let isShow = false
//   let app: ComponentExports<typeof App> | null = mount(App, {
//     target: document.getElementById('root')!,
//     props: {
//       onafterleave() {
//         unmountApp()
//       },
//     },
//   })
//   const unmountApp = () => {
//     if (app) {
//       unmount(app)
//       app = null
//     }
//   }
//   void tick().then(() => {
//     if (!app) return
//     isShow = true
//     app.show(position, message, autoCloseTime)
//   })

//   return () => {
//     if (isShow) app?.hide()
//     else unmountApp()
//   }
// }

export const tooltip = ({ delay = 0 }: { delay?: number } = {}) => {
  return (dom: HTMLElement) => {
    let instance: ComponentExports<typeof App> | null
    let prevTips = ''
    let prevX = 0
    let prevY = 0
    let isDraging = false

    const unmountApp = () => {
      if (instance) {
        void unmount(instance, { outro: true })
        instance = null
      }
    }
    const getTips = () => {
      return dom.getAttribute('aria-label')
    }

    const handleShowTips = (event: MouseEvent, update = false) => {
      if (isDraging) return
      let msg: string
      if (!prevTips || update) {
        let msg = getTips()?.trim()
        if (!msg) return
        prevTips = msg
      } else msg = prevTips

      instance ||= mount(App, {
        target: document.getElementById('root')!,
        props: {
          onafterleave() {
            unmountApp()
          },
        },
      })
      void tick().then(() => {
        instance?.show(
          {
            y: event.y + 12,
            x: event.x + 8,
          },
          msg,
          10000
        )
      })
    }
    const showTips = delay ? debounce(handleShowTips, delay) : handleShowTips

    const hideTips = () => {
      if (!instance) return
      instance.hide()
    }

    const setTips = (tips: string) => {
      if (!instance) return
      instance.setTips(tips)
    }

    const updateTips = (event: MouseEvent) => {
      if (isDraging) return
      if (!instance) {
        showTips(event, true)
        return
      }
      setTimeout(() => {
        let msg = getTips()
        if (!msg || prevTips === msg) return
        setTips(msg)
        prevTips = msg
      })
    }

    const handleMouseMove = (event: MouseEvent) => {
      if ((event.x == prevX && event.y == prevY) || isDraging) return
      prevX = event.x
      prevY = event.y
      hideTips()
      showTips(event)
    }
    dom.addEventListener('mousemove', handleMouseMove)
    dom.addEventListener('mouseleave', hideTips)
    dom.addEventListener('click', updateTips)
    dom.addEventListener('wheel', updateTips)
    dom.addEventListener('contextmenu', updateTips)
    const unsub = appEvent.on('focus', hideTips)
    const unsub2 = appEvent.on('drag', (end) => {
      if (end) {
        isDraging = false
      } else {
        isDraging = true
        hideTips()
      }
    })

    return () => {
      dom.removeEventListener('mousemove', handleMouseMove)
      dom.removeEventListener('mouseleave', hideTips)
      dom.removeEventListener('click', updateTips)
      dom.removeEventListener('wheel', updateTips)
      dom.removeEventListener('contextmenu', updateTips)
      unsub()
      unsub2()
      hideTips()
    }
  }
}
