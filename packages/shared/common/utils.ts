export * from './common'

// export function isLikelyGarbage(str: string, options: GarbageOptions = {}): boolean {
//   const {
//     badThreshold = 0.2,
//     minPrintableRatio = 0.8,
//     extendedLatinThreshold = 0.3,
//     minAsciiLetterRatio = 0.2,
//   } = options;

//   if (!str || str.length === 0) return false;

//   let badChars = 0;
//   let printableChars = 0;
//   let extendedLatinChars = 0;
//   let asciiLetters = 0;

//   // 常见 GBK/UTF-8 错误解码符号集合
//   const suspiciousSymbols: Set<string> = new Set([
//     "Ã", "Â", "¿", "Ç", "Ð", "×", "º", "¸", "½", "»", "«",
//     "¦", "§", "¤", "©", "ª", "¬", "®", "±", "µ", "¶", "·", "¸", "¹", "º", "»", "¼", "½", "¾", "¿", "×", "÷"
//   ]);

//   for (const ch of str) {
//     const code = ch.charCodeAt(0);

//     if (ch === "�" || suspiciousSymbols.has(ch)) {
//       badChars++;
//     }

//     if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
//       badChars++;
//     }

//     if ((code >= 32 && code <= 126) || (code >= 160 && code <= 0xffff)) {
//       printableChars++;
//     }

//     if (code >= 0x00a0 && code <= 0x00ff) {
//       extendedLatinChars++;
//     }

//     if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
//       asciiLetters++;
//     }
//   }

//   const badRatio = badChars / str.length;
//   const printableRatio = printableChars / str.length;
//   const extendedLatinRatio = extendedLatinChars / str.length;
//   const asciiLetterRatio = asciiLetters / str.length;

//   const suspiciousExtendedLatin =
//     extendedLatinRatio > extendedLatinThreshold && asciiLetterRatio < minAsciiLetterRatio;

//   return badRatio > badThreshold || printableRatio < minPrintableRatio || suspiciousExtendedLatin;
// }
interface GarbageOptions {
  /** 异常字符比例阈值 */
  badThreshold?: number
  /** 可打印字符比例下限 */
  minPrintableRatio?: number
  /** 扩展拉丁比例阈值 */
  extendedLatinThreshold?: number
  /** ASCII 字母比例阈值 */
  minAsciiLetterRatio?: number
  /** 最大连续扩展拉丁字符数，超过判定为垃圾 */
  maxConsecutiveExtended?: number
}
/**
 * 判断字符串是否可能是乱码
 * @param str - 输入字符串
 * @param options - 可选参数
 * @returns
 */
export const isLikelyGarbage = (str: string, options: GarbageOptions = {}): boolean => {
  const {
    badThreshold = 0.2,
    minPrintableRatio = 0.8,
    extendedLatinThreshold = 0.3,
    minAsciiLetterRatio = 0.2,
    maxConsecutiveExtended = 3,
  } = options

  if (!str || str.length === 0) return false

  let badChars = 0
  let printableChars = 0
  let extendedLatinChars = 0
  let asciiLetters = 0
  let consecutiveExtended = 0
  let maxConsec = 0

  for (const ch of str) {
    const code = ch.charCodeAt(0)

    // 替换符
    if (ch === '�') badChars++

    // 控制符（排除 tab、换行、回车）
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      badChars++
    }

    // 可打印范围
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 0xffff)) {
      printableChars++
    }

    // 扩展拉丁字符
    if (code >= 0x00a0 && code <= 0x00ff) {
      extendedLatinChars++
      consecutiveExtended++
      maxConsec = Math.max(maxConsec, consecutiveExtended)
    } else {
      consecutiveExtended = 0
    }

    // ASCII 字母
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      asciiLetters++
    }
  }

  const badRatio = badChars / str.length
  const printableRatio = printableChars / str.length
  const extendedLatinRatio = extendedLatinChars / str.length
  const asciiLetterRatio = asciiLetters / str.length

  // 连续扩展拉丁堆检测
  const suspiciousExtendedLatin = extendedLatinRatio > extendedLatinThreshold && asciiLetterRatio < minAsciiLetterRatio

  const hasLongConsecutiveExtended = maxConsec >= maxConsecutiveExtended

  if (badRatio > badThreshold || printableRatio < minPrintableRatio || suspiciousExtendedLatin || hasLongConsecutiveExtended) {
    console.log('isLikelyGarbage', `(${str})`)
  }
  return badRatio > badThreshold || printableRatio < minPrintableRatio || suspiciousExtendedLatin || hasLongConsecutiveExtended
}

export const cloneData = <T>(data: T) => {
  return data === undefined
    ? data
    : ((import.meta.env.VITE_IS_WINDOWS_LEGACY ? JSON.parse(JSON.stringify(data)) : structuredClone(data)) as T)
}
