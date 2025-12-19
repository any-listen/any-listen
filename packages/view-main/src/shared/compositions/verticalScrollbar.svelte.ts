import { onDomScrollSizeChanged, onDomSizeChanged } from '@any-listen/web'

export const verticalScrollbar = ({
  scrollbarWidth = '0.5rem',
  offset = '0.3125rem',
  autoHide = true,
}: { scrollbarWidth?: string; offset?: string; autoHide?: boolean } = {}) => {
  return (dom: HTMLElement) => {
    dom.style.overflowY = 'scroll'
    dom.style.position = 'relative'
    dom.style.marginRight = 'var(--scrollbar-width-negative)'

    const parentNode = dom.parentNode as HTMLElement
    parentNode.style.position = 'relative'

    const scrollbar = document.createElement('div')
    scrollbar.classList.add('custom-scrollbar')
    parentNode.appendChild(scrollbar)
    scrollbar.ariaHidden = 'true'
    scrollbar.style.width = scrollbarWidth
    scrollbar.style.right = offset
    if (!autoHide) scrollbar.classList.add('visible')

    const scrollbarThumb = document.createElement('div')
    scrollbarThumb.classList.add('custom-scrollbar-thumb')
    scrollbar.appendChild(scrollbarThumb)

    // 计算滚动条比例
    let scrollbarVisible = true
    let scrollbarHide = false
    let scrollbarThumbHide = false
    let isMouseEnter = false
    let scrollbarHeight = 0
    let containerHeight = 0
    let contentHeight = 0
    const updateScrollbar = () => {
      if (dom.scrollHeight == contentHeight && dom.clientHeight == containerHeight) return
      // console.log(scrollbarHide)
      containerHeight = dom.clientHeight
      contentHeight = dom.scrollHeight
      if (dom.scrollHeight <= dom.clientHeight) {
        if (scrollbarHide) return
        if (autoHide) {
          scrollbar.style.display = 'none'
          scrollbarVisible = false
          scrollbarHide = true
        } else if (!scrollbarThumbHide) {
          scrollbarThumbHide = true
          scrollbarThumb.style.display = 'none'
        }
      } else {
        if (scrollbarHide) {
          scrollbar.style.display = 'block'
          scrollbarHide = false
        }
        if (scrollbarThumbHide) {
          scrollbarThumb.style.display = 'block'
          scrollbarThumbHide = false
        }
        scrollbarVisible ||= true
        scrollbarHeight = Math.max(containerHeight * (containerHeight / contentHeight), 30)
        scrollbarThumb.style.height = `${scrollbarHeight}px`
        updateThumbPosition()
        if (isMouseEnter) showScrollbar()
      }
    }

    // 更新滚动条的位置
    const updateThumbPosition = () => {
      const scrollPercentage = dom.scrollTop / (contentHeight - containerHeight)
      const scrollbarThumbTop = scrollPercentage * (containerHeight - scrollbarHeight)
      scrollbarThumb.style.transform = `translateY(${scrollbarThumbTop}px)`
    }

    // 处理内容滚动时同步滚动条滑块
    dom.addEventListener('scroll', updateThumbPosition, {
      passive: true,
    })
    let unsub = onDomSizeChanged(dom, updateScrollbar)
    let unsub2 = onDomScrollSizeChanged(dom, updateScrollbar)

    const showScrollbar = () => {
      isMouseEnter = true
      if (!scrollbarVisible) return
      scrollbar.classList.add('visible')
    }
    const hideScrollbar = () => {
      isMouseEnter = false
      if (!scrollbarVisible || !autoHide) return
      scrollbar.classList.remove('visible')
    }
    dom.addEventListener('mouseenter', showScrollbar)
    dom.addEventListener('mouseleave', hideScrollbar)

    const handleScrollBarMsDown = (event: MouseEvent) => {
      if (event.target !== scrollbar || event.button !== 0) return
      event.preventDefault()

      const scrollbarRect = scrollbar.getBoundingClientRect()
      const clickY = event.clientY - scrollbarRect.top

      const halfThumbHeight = scrollbarHeight / 2
      // 计算点击位置，使滑块居中
      let targetY = clickY - halfThumbHeight

      // 限制滑块在滚动条范围内
      if (targetY < 0) {
        targetY = 0 // 滚动到顶部
      } else if (targetY + scrollbarHeight > containerHeight) {
        targetY = containerHeight - scrollbarHeight // 滚动到底部
      }

      // 计算新的内容滚动位置
      const scrollPercentage = targetY / (containerHeight - scrollbarHeight)
      const newScrollTop = scrollPercentage * (contentHeight - containerHeight)

      // 设置内容的滚动位置
      dom.scrollTop = newScrollTop
    }
    scrollbar.addEventListener('mousedown', handleScrollBarMsDown)

    // 处理拖动滚动条滑块
    let isMsDown = false
    let startY = 0
    let startScrollTop = 0
    const msDown = (e: MouseEvent) => {
      isMsDown = true
      startY = e.clientY
      startScrollTop = dom.scrollTop
      document.body.style.userSelect = 'none' // 禁用文本选择
    }
    const msMove = (e: MouseEvent) => {
      if (!isMsDown) return
      const deltaY = e.clientY - startY
      const scrollPercentage = deltaY / containerHeight
      dom.scrollTop = startScrollTop + scrollPercentage * contentHeight
    }
    const msUp = () => {
      if (!isMsDown) return
      isMsDown = false
    }
    scrollbarThumb.addEventListener('mousedown', msDown)
    document.addEventListener('mousemove', msMove)
    document.addEventListener('mouseup', msUp)

    const handleCtxMenu = (event: MouseEvent) => {
      event.preventDefault() // 阻止滚动条的默认右键菜单

      // 暂时禁用滚动条的指针事件
      scrollbar.style.pointerEvents = 'none'

      // 获取光标下的元素
      const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY)

      // 恢复滚动条的指针事件
      scrollbar.style.pointerEvents = 'auto'

      if (elementUnderCursor) {
        // 创建一个新的 contextmenu 事件
        const newEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: event.clientX,
          clientY: event.clientY,
          button: event.button,
          buttons: event.buttons,
          relatedTarget: null,
          screenX: event.screenX,
          screenY: event.screenY,
        })

        // 将事件派发到底层元素
        elementUnderCursor.dispatchEvent(newEvent)
      }
    }
    scrollbar.addEventListener('contextmenu', handleCtxMenu)
    return () => {
      parentNode.removeChild(scrollbar)
      dom.removeEventListener('scroll', updateThumbPosition)
      unsub()
      unsub2()
      dom.removeEventListener('mouseenter', showScrollbar)
      dom.removeEventListener('mouseleave', hideScrollbar)

      scrollbar.removeEventListener('mousedown', handleScrollBarMsDown)
      scrollbarThumb.removeEventListener('mousedown', msDown)
      document.removeEventListener('mousemove', msMove)
      document.removeEventListener('mouseup', msUp)

      scrollbar.removeEventListener('contextmenu', handleCtxMenu)
    }
  }
}
