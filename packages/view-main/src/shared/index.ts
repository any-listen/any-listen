import { dateFormat } from '@any-listen/common/utils'

import { i18n } from '@/plugins/i18n'

// export * from '@common/utils/renderer'
// export * from '@common/utils/nodejs'
export * from '@any-listen/common/utils'
// export * from '@common/utils/tools'

/**
 * 格式化播放数量
 * @param {*} num 数字
 */
export const formatPlayCount = (num: number): string => {
  if (num > 100000000) return `${Math.trunc(num / 10000000) / 10}亿`
  if (num > 10000) return `${Math.trunc(num / 1000) / 10}万`
  return String(num)
}

/**
 * 时间格式化
 */
export const dateFormat2 = (time: number): string => {
  let differ = Math.trunc((Date.now() - time) / 1000)
  if (differ < 60) {
    return i18n.t('date_format_second', { num: differ })
  } else if (differ < 3600) {
    return i18n.t('date_format_minute', { num: Math.trunc(differ / 60) })
  } else if (differ < 86400) {
    return i18n.t('date_format_hour', { num: Math.trunc(differ / 3600) })
  }
  return dateFormat(time)
}

export const parseInterval = (intvStr: string | null) => {
  if (!intvStr) return 0
  // if (musicInfo._interval) return musicInfo._interval
  let intvArr = intvStr.split(':')
  let intv = 0
  let unit = 1
  while (intvArr.length) {
    intv += parseInt(intvArr.pop()!) * unit
    unit *= 60
  }
  if (Number.isNaN(intv)) return 0
  return intv
}

/**
 * 设置标题
 */
export const setTitle = (title: string | null) => {
  let domTitle = document.getElementsByTagName('title')[0]
  title ||= i18n.t('anylisten')
  domTitle.innerText = title
}

// export const getProxyInfo = () => {
//   return proxy.enable && proxy.host
//     ? `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
//     : proxy.envProxy
//       ? `http://${proxy.envProxy.host}:${proxy.envProxy.port}`
//       : undefined
// }

export const getFontSizeWithScreen = (screenWidth: number = window.innerWidth): number => {
  return screenWidth <= 1440 ? 16 : screenWidth <= 1920 ? 18 : screenWidth <= 2560 ? 20 : screenWidth <= 2560 ? 20 : 22
}

export const deduplicationList = <T extends AnyListen.Music.MusicInfo>(list: T[]): T[] => {
  const ids = new Set<string>()
  return list.filter((s) => {
    if (ids.has(s.id)) return false
    ids.add(s.id)
    return true
  })
}

export const createUnsubscriptionSet = () => {
  return {
    isClean: true,
    subscriptions: new Set<() => void>(),
    add(unsubscribe: () => void) {
      this.subscriptions.add(unsubscribe)
      this.isClean &&= false
    },
    register(register: (set: Set<() => void>) => void) {
      if (!this.isClean) return
      register(this.subscriptions)
      this.isClean = false
    },
    clear() {
      if (this.isClean) return
      for (const fn of this.subscriptions.values()) fn()
      this.subscriptions.clear()
      this.isClean = true
    },
  }
}
