import { mount, tick, type ComponentExports } from 'svelte'
import App from './App.svelte'
import { debounce } from '@/shared'
import { appEvent } from '@/modules/app/store/event'
let instance: ComponentExports<typeof App> | null
let prevTips = ''
let prevX = 0
let prevY = 0
let isDraging = false

const getTipText = (el: HTMLElement) => {
  return el.getAttribute('aria-label') && el.getAttribute('data-ignore-tip') == null ? el.getAttribute('aria-label') : null
}

const getTips = (el: HTMLElement | null): string | null => {
  if (el) {
    const text = getTipText(el)
    if (text) return text
    else if (el.parentNode === document.documentElement) return null
    return getTips(el.parentNode as HTMLElement | null)
  }
  return null
}

const showTips = debounce((event: MouseEvent) => {
  if (isDraging) return
  let msg = getTips(event.target as HTMLElement)?.trim()
  if (!msg) return
  prevTips = msg

  instance ||= mount(App, {
    target: document.getElementById('root')!,
  })
  void tick().then(() => {
    instance?.show(
      {
        y: event.y + 12,
        x: event.x + 8,
      },
      msg,
      5000
    )
  })
}, 300)

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
    showTips(event)
    return
  }
  setTimeout(() => {
    let msg = getTips(event.target as HTMLElement)
    if (!msg || prevTips === msg) return
    setTips(msg)
    prevTips = msg
  })
}

export const initTooltips = () => {
  setTimeout(() => {
    document.body.addEventListener('mousemove', (event) => {
      if ((event.x == prevX && event.y == prevY) || isDraging) return
      prevX = event.x
      prevY = event.y
      hideTips()
      showTips(event)
    })

    document.body.addEventListener('click', updateTips)
    document.body.addEventListener('contextmenu', updateTips)
    document.body.addEventListener('wheel', updateTips)
    appEvent.on('focus', () => {
      hideTips()
    })
    appEvent.on('drag', (end) => {
      if (end) {
        isDraging = false
      } else {
        isDraging = true
        hideTips()
      }
    })
  })
}
