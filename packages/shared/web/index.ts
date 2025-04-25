export const onDomSizeChanged = (dom: HTMLElement, onChanged: (width: number, height: number) => void) => {
  // 使用 ResizeObserver 监听大小变化
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      // console.log(dom.offsetLeft, dom.offsetTop, left, top, width, height)
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
