/**
 * 生成防抖函数
 */
export const debounce = <Args extends any[]>(fn: (...args: Args) => void | Promise<void>, delay = 100) => {
  let timer: number | null = null
  let _args: Args
  return (...args: Args) => {
    _args = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void fn(..._args)
    }, delay)
  }
}

const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

type Noop = () => void
const noop: Noop = () => {}
type ScrollElement<T> = {
  __scrollLockKey?: number
  __scrollNextParams?: [ScrollElement<HTMLElement>, number, number, Noop, Noop]
  __scrollTimeout?: number
  __scrollDelayTimeout?: number
  scrollTop?: number
  scrollY?: number
  scrollTo?: HTMLElement['scrollTo']
} & Omit<T, 'scrollTop' | 'scrollTo'>

const handleScrollY = (
  element: ScrollElement<HTMLElement> | null,
  to: number,
  duration = 300,
  onEnd = noop,
  onCancel = noop
): Noop => {
  if (!element) {
    onCancel()
    return noop
  }
  const clean = () => {
    element.__scrollLockKey = undefined
    element.__scrollNextParams = undefined
    if (element.__scrollTimeout) window.clearTimeout(element.__scrollTimeout)
    element.__scrollTimeout = undefined
  }
  if (element.__scrollLockKey) {
    element.__scrollNextParams?.[4]()
    element.__scrollNextParams = [element, to, duration, onEnd, onCancel]
    element.__scrollLockKey = -1
    return clean
  }

  const start = element.scrollTop ?? element.scrollY ?? 0
  if (to > start) {
    let maxScrollTop = element.scrollHeight - element.clientHeight
    if (to > maxScrollTop) to = maxScrollTop
  } else if (to < start) {
    if (to < 0) to = 0
  } else {
    onEnd()
    return noop
  }
  const change = to - start
  const increment = 10
  if (!change) {
    onEnd()
    return noop
  }

  let currentTime = 0
  let val: number
  let key = Math.random()

  const animateScroll = () => {
    element.__scrollTimeout = undefined
    // if (element.__scrollLockKey != key) {
    if (element.__scrollNextParams && currentTime > duration * 0.75) {
      const [_element, to, duration, onEnd, onCancel] = element.__scrollNextParams
      clean()
      onCancel()
      handleScrollY(_element, to, duration, onEnd, onCancel)
      return
    }

    currentTime += increment
    val = Math.trunc(easeInOutQuad(currentTime, start, change, duration))
    if (element.scrollTo) {
      element.scrollTo(0, val)
    } else {
      element.scrollTop = val
    }
    if (currentTime < duration) {
      element.__scrollTimeout = window.setTimeout(animateScroll, increment)
    } else if (element.__scrollNextParams) {
      const [_element, to, duration, onEnd, onCancel] = element.__scrollNextParams
      clean()
      handleScrollY(_element, to, duration, onEnd, onCancel)
    } else {
      clean()
      onEnd()
    }
  }

  element.__scrollLockKey = key
  animateScroll()

  return clean
}
/**
 * 设置滚动条位置
 * @param element 要设置滚动的容器 dom
 * @param to 滚动的目标位置
 * @param duration 滚动完成时间 ms
 * @param fn 滚动完成后的回调
 * @param delay 延迟执行时间
 */
export const handleScroll = (
  element: ScrollElement<HTMLElement>,
  to: number,
  duration = 300,
  onEnd = () => {},
  onCancel = () => {},
  delay = 0
): (() => void) => {
  let cancelFn: () => void
  if (element.__scrollDelayTimeout != null) {
    window.clearTimeout(element.__scrollDelayTimeout)
    element.__scrollDelayTimeout = undefined
  }
  if (delay) {
    let scrollCancelFn: Noop | null = null
    cancelFn = () => {
      if (element.__scrollDelayTimeout == null) {
        scrollCancelFn?.()
      } else {
        window.clearTimeout(element.__scrollDelayTimeout)
        element.__scrollDelayTimeout = undefined
        onCancel()
      }
    }
    element.__scrollDelayTimeout = window.setTimeout(() => {
      element.__scrollDelayTimeout = undefined
      scrollCancelFn = handleScrollY(element, to, duration, onEnd, onCancel)
    }, delay)
  } else {
    cancelFn = handleScrollY(element, to, duration, onEnd, onCancel)
  }
  return cancelFn
}
