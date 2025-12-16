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
  const observer = new MutationObserver(() => {
    if (dom.scrollHeight !== lastScrollHeight) {
      lastScrollHeight = dom.scrollHeight
      onChanged(lastScrollHeight)
    }
  })

  observer.observe(dom, {
    childList: true, // 监听子元素的变化
    subtree: true, // 监听后代元素的变化
    characterData: true, // 监听文本节点的变化
  })

  onChanged(lastScrollHeight)

  return () => {
    observer.disconnect()
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

export const checkPicUrl = async (picUrl: string | null | undefined) => {
  if (!picUrl) return true
  return new Promise<void>((resolve, reject) => {
    const image = new Image(1, 1)
    image.addEventListener(
      'load',
      () => {
        resolve()
      },
      { once: true }
    )
    image.addEventListener(
      'error',
      () => {
        reject(new Error(`Error loading image at ${picUrl}`))
      },
      { once: true }
    )
    image.alt = ''
    image.src = picUrl
  })
}
