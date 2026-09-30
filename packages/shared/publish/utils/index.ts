import { join } from 'node:path'

/**
 *
 * @param  {...string} p
 * @returns
 */
export function jp(...p: string[]): string {
  return p.length ? join(import.meta.dirname, ...p) : import.meta.dirname
}

/**
 * 时间格式化
 * @param {Date | string} [d] 格式化的时间
 * @param {boolean} [b] 是否精确到秒
 */
export function formatTime(d?: Date | string, b = false): string {
  const _date = d == null ? new Date() : typeof d == 'string' ? new Date(d) : d
  const year = _date.getFullYear()
  const month = fm(_date.getMonth() + 1)
  const day = fm(_date.getDate())
  if (!b) return `${year}-${month}-${day}`
  return `${year}-${month}-${day} ${fm(_date.getHours())}:${fm(_date.getMinutes())}:${fm(_date.getSeconds())}`
}

/**
 *
 * @param {number} value
 * @returns
 */
function fm(value: number): string {
  if (value < 10) return `0${value}`
  return value.toString()
}
