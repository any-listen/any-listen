import { throttle } from '@any-listen/common/common'
import { API_PREFIX, PROXY_URL_PATH } from '@any-listen/common/constants'
import { buildRealPublicPath } from '@any-listen/common/tools'
import { isUrl } from '@any-listen/common/utils'

export const onDomSizeChanged = (dom: HTMLElement, onChanged: (width: number, height: number) => void) => {
  // 使用 ResizeObserver 监听大小变化
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      // console.log(dom, width, height)
      onChanged(Math.trunc(width), Math.trunc(height))
    }
  })

  resizeObserver.observe(dom)

  onChanged(dom.clientWidth, dom.clientHeight)

  return () => {
    resizeObserver.disconnect()
  }
}

export const onDomScrollSizeChanged = (dom: HTMLElement, onChanged: (scrollheight: number) => void) => {
  // 使用 ResizeObserver 监听大小变化
  let lastScrollHeight = dom.scrollHeight
  const handleHeightChange = throttle(() => {
    if (dom.scrollHeight === lastScrollHeight) return
    lastScrollHeight = dom.scrollHeight
    onChanged(lastScrollHeight)
  }, 100)
  const observer = new MutationObserver(handleHeightChange)

  observer.observe(dom, {
    childList: true, // 监听子元素的变化
    subtree: true, // 监听后代元素的变化
    characterData: true, // 监听文本节点的变化
  })

  onChanged(lastScrollHeight)

  const handleImageLoad = (event: Event) => {
    if (event.target instanceof HTMLImageElement) handleHeightChange()
  }

  dom.addEventListener('load', handleImageLoad, true)
  dom.addEventListener('error', handleImageLoad, true)

  return () => {
    observer.disconnect()
    dom.removeEventListener('load', handleImageLoad, true)
    dom.removeEventListener('error', handleImageLoad, true)
  }
}

// let scrollbarWidth: number
// export const getScrollbarWidth = () => {
//   // 用缓存避免多次创建元素
//   if (scrollbarWidth !== undefined) return scrollbarWidth

//   const scrollDiv = document.createElement('div')
//   scrollDiv.style.cssText = `
//     position: absolute;
//     top: -9999px;
//     width: 100px;
//     height: 100px;
//     overflow: scroll;
//   `

//   document.body.appendChild(scrollDiv)
//   const sw = scrollDiv.offsetWidth - scrollDiv.clientWidth
//   document.body.removeChild(scrollDiv)

//   scrollbarWidth = sw

//   return scrollbarWidth
// }

export const createClickHandle = <T extends unknown[] = unknown[]>(
  click: (...args: T) => void,
  doubleClick: (...args: T) => void,
  delay = 400
) => {
  let clickTime = 0
  let clickInfo: T[0] | null = null
  return (...args: T) => {
    if (window.performance.now() - clickTime > delay || clickInfo !== args[0]) {
      clickTime = window.performance.now()
      clickInfo = args[0]
      click(...args)
      return
    }
    clickTime = 0
    clickInfo = null
    doubleClick(...args)
  }
}

export const getDocumentHidden = () => {
  return document.hidden
}

// 可见性改变
export const onVisibilityChange = (callback: (hidden: boolean) => void) => {
  const handleVisibilityChange = () => {
    callback(document.hidden)
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

export const buildUrl = (url: string, enableProxy: boolean, proxyServerHost: string) => {
  // console.log('buildUrl', url, enableProxy, proxyServerHost)
  if (url.startsWith(proxyServerHost)) return url
  url = buildRealPublicPath(url, proxyServerHost)
  if (!import.meta.env.VITE_IS_WEB) return url
  if (!enableProxy) return url
  if (import.meta.env.DEV) {
    if (!isUrl(url) || url.startsWith('http://localhost:9500')) return url
    return `http://localhost:9500${API_PREFIX}${PROXY_URL_PATH}/${encodeURIComponent(url)}`
  }
  if (!isUrl(url) || url.startsWith(location.origin)) return url
  return `${location.origin}${API_PREFIX}${PROXY_URL_PATH}/${encodeURIComponent(url)}`
}

export const checkPicUrl = async (picUrl: string | null | undefined, enableProxy: boolean, proxyServerHost: string) => {
  if (!picUrl) return true
  if (!picUrl.startsWith(proxyServerHost)) picUrl = buildUrl(picUrl, enableProxy, proxyServerHost)

  return new Promise<boolean>((resolve, reject) => {
    const image = new Image(1, 1)
    image.addEventListener(
      'load',
      () => {
        resolve(true)
      },
      { once: true }
    )
    image.addEventListener(
      'error',
      () => {
        resolve(false)
      },
      { once: true }
    )
    image.alt = ''
    image.src = picUrl
  })
}

let themeMediaQuery: MediaQueryList
const initThemeMediaQuery = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (themeMediaQuery) return
  themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
}
export const onSystemThemeModeChanged = (handler: (isDark: boolean) => void) => {
  initThemeMediaQuery()
  const handleThemeChange = (e: MediaQueryListEvent) => {
    handler(e.matches)
  }

  // 监听变化
  themeMediaQuery.addEventListener('change', handleThemeChange)

  return () => {
    themeMediaQuery.removeEventListener('change', handleThemeChange)
  }
}
export const getSystemThemeIsDark = () => {
  initThemeMediaQuery()
  return themeMediaQuery.matches
}
