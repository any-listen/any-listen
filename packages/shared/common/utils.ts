// 非业务工具方法

/**
 * 获取两个数之间的随机整数，大于等于min，小于max
 * @param {*} min
 * @param {*} max
 */
export const getRandom = (min: number, max: number): number => Math.floor(Math.random() * (max - min)) + min

const units = ['B', 'KB', 'MB', 'GB', 'TB']
export const sizeFormate = (size: number): string => {
  // https://gist.github.com/thomseddon/3511330
  if (!size) return '0 B'
  const number = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / Math.pow(1024, Math.floor(number))).toFixed(2)} ${units[number]}`
}

/**
 * 将字符串、时间戳等格式转成时间对象
 * @param date 时间
 * @returns 时间对象或空字符串
 */
export const toDateObj = (date?: number | string | Date): Date | '' => {
  // console.log(date)
  if (!date) return ''
  switch (typeof date) {
    case 'string':
      if (!date.includes('T')) date = date.split('.')[0].replace(/-/g, '/')
    // eslint-disable-next-line no-fallthrough
    case 'number':
      date = new Date(date)
    // eslint-disable-next-line no-fallthrough
    case 'object':
      break
    default:
      return ''
  }
  return date
}

const numFix = (n: number): string => (n < 10 ? `0${n}` : n.toString())
type FormatTypes = 'Y-M-D h:m:s' | 'Y-M-D h:m' | 'Y-M-D h' | 'Y-M-D' | 'Y-M' | 'Y'
/**
 * 时间格式化
 * @param _date 时间
 * @param format Y-M-D h:m:s Y年 M月 D日 h时 m分 s秒
 */
export const dateFormat = (_date: number | string | Date, format: FormatTypes = 'Y-M-D h:m:s') => {
  // console.log(date)
  const date = toDateObj(_date)
  if (!date) return ''
  return format
    .replace('Y', date.getFullYear().toString())
    .replace('M', numFix(date.getMonth() + 1))
    .replace('D', numFix(date.getDate()))
    .replace('h', numFix(date.getHours()))
    .replace('m', numFix(date.getMinutes()))
    .replace('s', numFix(date.getSeconds()))
}

export const formatPlayTime = (time: number) => {
  const m = Math.trunc(time / 60)
  const s = Math.trunc(time % 60)
  return m == 0 && s == 0 ? '--/--' : `${numFix(m)}:${numFix(s)}`
}

export const formatPlayTime2 = (time: number) => {
  const m = Math.trunc(time / 60)
  const s = Math.trunc(time % 60)
  return `${numFix(m)}:${numFix(s)}`
}

export const isUrl = (path: string) => /https?:\/\//.test(path)

// 解析URL参数为对象
export const parseUrlParams = (str: string): Record<string, string> => {
  const params: Record<string, string> = {}
  if (typeof str !== 'string') return params
  const paramsArr = str.split('&')
  for (const param of paramsArr) {
    const [key, value] = param.split('=')
    params[key] = value ? decodeURIComponent(value) : value
  }
  return params
}

/**
 * 生成节流函数
 * @param fn 回调
 * @param delay 延迟
 * @returns
 */
export function throttle<Args extends unknown[]>(fn: (...args: Args) => void | Promise<void>, delay = 100) {
  let timer: unknown = null
  let _args: Args
  return (...args: Args) => {
    _args = args
    if (timer) return
    timer = setTimeout(() => {
      timer = null
      void fn(..._args)
    }, delay)
  }
}

/**
 * 生成防抖函数
 * @param fn 回调
 * @param delay 延迟
 * @returns
 */
export function debounce<Args extends unknown[]>(fn: (...args: Args) => void | Promise<void>, delay = 100) {
  let timer: unknown = null
  let _args: Args
  return (...args: Args) => {
    _args = args
    // @ts-expect-error
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void fn(..._args)
    }, delay)
  }
}

const fileNameRxp = /[\\/:*?#"<>|]/g
export const filterFileName = (name: string): string => name.replace(fileNameRxp, '')

// https://blog.csdn.net/xcxy2015/article/details/77164126#comments
/**
 *
 * @param a
 * @param b
 */
export const similar = (a: string, b: string) => {
  if (!a || !b) return 0
  if (a.length > b.length) {
    // 保证 a <= b
    const t = b
    b = a
    a = t
  }
  const al = a.length
  const bl = b.length
  const mp = [] // 一个表
  let i, j, ai, lt, tmp // ai：字符串a的第i个字符。 lt：左上角的值。 tmp：暂存新的值。
  for (i = 0; i <= bl; i++) mp[i] = i
  for (i = 1; i <= al; i++) {
    ai = a.charAt(i - 1)
    lt = mp[0]
    mp[0] = mp[0] + 1
    for (j = 1; j <= bl; j++) {
      tmp = Math.min(mp[j] + 1, mp[j - 1] + 1, lt + (ai == b.charAt(j - 1) ? 0 : 1))
      lt = mp[j]
      mp[j] = tmp
    }
  }
  return 1 - mp[bl] / bl
}

/**
 * 排序字符串
 * @param arr
 * @param data
 */
export const sortInsert = <T>(arr: Array<{ num: number; data: T }>, data: { num: number; data: T }) => {
  const key = data.num
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const middle = Math.trunc((left + right) / 2)
    if (key == arr[middle].num) {
      left = middle
      break
    } else if (key < arr[middle].num) {
      right = middle - 1
    } else {
      left = middle + 1
    }
  }
  while (left > 0) {
    if (arr[left - 1].num != key) break
    left--
  }

  arr.splice(left, 0, data)
}

export const encodePath = (path: string) => encodeURI(path.replaceAll('\\', '/'))

export const arrPush = <T>(list: T[], newList: T[]) => {
  for (let i = 0; i * 1000 < newList.length; i++) {
    list.push(...newList.slice(i * 1000, (i + 1) * 1000))
  }
  return list
}

export const arrUnshift = <T>(list: T[], newList: T[]) => {
  for (let i = 0; i * 1000 < newList.length; i++) {
    list.splice(i * 1000, 0, ...newList.slice(i * 1000, (i + 1) * 1000))
  }
  return list
}

export const arrPushByPosition = <T>(list: T[], newList: T[], position: number) => {
  for (let i = 0; i * 1000 < newList.length; i++) {
    list.splice(position + i * 1000, 0, ...newList.slice(i * 1000, (i + 1) * 1000))
  }
  return list
}

export const arrReplace = <T>(list: T[], newList: T[]) => {
  list.splice(0, list.length)
  arrPush(list, newList)
  return list
}

// https://stackoverflow.com/a/2450976
export const arrShuffle = <T>(array: T[]) => {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

// https://stackoverflow.com/a/53387532
// treat non-numerical characters as lower version
// replacing them with a negative number based on charcode of first character
const prep = (t: string) =>
  t
    .replace(
      /[^\d.]+/g,
      (c) =>
        `.${
          c
            .replace(/[\W_]+/, '')
            .toUpperCase()
            .charCodeAt(0) - 65536
        }.`
    )
    // remove trailing "." and "0" if followed by non-numerical characters (1.0.0b);
    .replace(/(?:\.0+)*(\.-\d+(?:\.\d+)?)\.*$/g, '$1')
    // return array
    .split('.')
/**
 * compare Versions
 * @param a old version
 * @param b new version
 * @returns 1: a > b, 0: a = b, -1: a < b
 */
export const compareVersions = (a: string, b: string) => {
  const aArr = prep(a)
  const bArr = prep(b)
  const l = Math.max(aArr.length, bArr.length)
  let i = 0
  let r = i
  // convert into integer, uncluding undefined values
  while (!r && i < l) {
    r = ~~aArr[i] - ~~bArr[i++]
  }
  return r < 0 ? -1 : r ? 1 : 0
}

// https://stackoverflow.com/a/44078785
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const generateIdByPerf = () => {
  return performance.now().toString(36).replace('.', '') + Math.random().toString(36).slice(2)
}
export const generateIdSimple = () => {
  return Math.random().toString(36).slice(2)
}
