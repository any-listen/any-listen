import { appEvent } from '@/modules/app/store/event'
import { debounce } from '@/shared'
import { mount, tick, type ComponentExports } from 'svelte'
import App from './App.svelte'
let instance: ComponentExports<typeof App> | null
let prevTips: TipInfo | null = null
let prevX = 0
let prevY = 0
let isDraging = false
let updateTimeout: number | null = null
let visible = false

interface TipInfo {
  text: string
  clickHide: boolean
  el: HTMLElement
}
const getTipTextInfo = (el: HTMLElement) => {
  return el.getAttribute('aria-label') && el.getAttribute('data-ignore-tip') == null
    ? ({
        text: el.getAttribute('aria-label')!.trim(),
        clickHide: el.hasAttribute('data-click-hide'),
        el,
      } as const)
    : null
}

const equalTips = (a: TipInfo | null, b: TipInfo | null) => {
  if (a === b) return true
  if (!a || !b) return false
  return a.text === b.text && a.clickHide === b.clickHide && a.el === b.el
}

const getTips = (el: HTMLElement | null): TipInfo | null => {
  if (el) {
    const info = getTipTextInfo(el)
    if (info) return info
    else if (el.parentNode === document.documentElement) return null
    return getTips(el.parentNode as HTMLElement | null)
  }
  return null
}

const debounceShowTips = debounce((event: MouseEvent) => {
  if (isDraging || !visible) return
  const tips = getTips(event.target as HTMLElement)
  if (!tips?.text) return
  prevTips = tips

  instance ||= mount(App, {
    target: document.getElementById('root')!,
  })
  void tick().then(() => {
    instance?.show(
      {
        y: event.y + 12,
        x: event.x + 8,
      },
      tips.text,
      5000
    )
  })
}, 300)
const showTips = (event: MouseEvent) => {
  visible ||= true
  debounceShowTips(event)
}

const hideTips = () => {
  if (!instance || !visible) return
  visible = false
  instance.hide()
  if (updateTimeout) {
    clearTimeout(updateTimeout)
    updateTimeout = null
  }
}

const setTips = (tips: string) => {
  if (!instance) return
  instance.setTips(tips)
}

const updateTips = (event: MouseEvent) => {
  if (isDraging || !visible) return
  if (!instance) {
    showTips(event)
    return
  }
  if (updateTimeout) clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    let tips = getTips(event.target as HTMLElement)
    if (equalTips(prevTips, tips)) return
    if (tips) {
      setTips(tips.text)
    } else {
      hideTips()
    }
    prevTips = tips
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

    document.body.addEventListener('click', (event) => {
      if (prevTips?.clickHide) {
        hideTips()
        return
      }
      updateTips(event)
    })
    document.body.addEventListener('contextmenu', updateTips)
    document.body.addEventListener('wheel', updateTips)
    document.body.addEventListener('mouseout', hideTips)
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
