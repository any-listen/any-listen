const toRgbNumber = (value: string) => {
  return Number.parseInt(value, 10)
}

const shadeColor = (percent: number, color: string) => {
  const [red, green, blue, alpha] = color.split(',')
  const isDark = percent < 0
  const target = isDark ? 0 : 255 * percent
  const weight = isDark ? 1 + percent : 1 - percent
  return `rgb${alpha ? 'a' : ''}(${Math.round(toRgbNumber(red.slice(red[3] == 'a' ? 5 : 4)) * weight + target)}, ${Math.round(
    toRgbNumber(green) * weight + target
  )}, ${Math.round(toRgbNumber(blue) * weight + target)}${alpha ? `,${alpha}` : ')'}`
}

const alphaColor = (percent: number, color: string) => {
  const [red, green, blue, alpha] = color.split(',')
  let normalizedAlpha: number
  if (alpha) {
    normalizedAlpha = Number.parseFloat(alpha)
    normalizedAlpha = percent < 0 ? Math.max(0, normalizedAlpha + (1 - normalizedAlpha) * percent) : Math.min(1, normalizedAlpha - normalizedAlpha * percent)
  } else {
    normalizedAlpha = Math.min(1, 1 - percent)
  }
  return `rgba(${toRgbNumber(red.slice(red[3] == 'a' ? 5 : 4))}, ${toRgbNumber(green)}, ${toRgbNumber(blue)}, ${normalizedAlpha.toFixed(2)})`
}

const createFontDarkColors = (rgbaColor: string) => {
  const colors: Record<string, string> = {
    '--color-1000': rgbaColor,
  }
  let preColor = rgbaColor
  for (let i = 1; i < 21; i += 1) {
    preColor = shadeColor(-0.05, preColor)
    colors[`--color-${String(1000 - 50 * i).padStart(3, '0')}`] = preColor
  }
  return colors
}

const createFontColors = (rgbaColor: string | undefined, isDark: boolean) => {
  rgbaColor ??= isDark ? 'rgb(229, 229, 229)' : 'rgb(33, 33, 33)'
  if (isDark) return createFontDarkColors(rgbaColor)

  const colors: Record<string, string> = {
    '--color-1000': rgbaColor,
  }
  for (let i = 1; i < 21; i += 1) {
    colors[`--color-${String(1000 - 50 * i).padStart(3, '0')}`] = shadeColor(0.05 * i, rgbaColor)
  }
  return colors
}

export const createThemeColors = (rgbaColor: string, fontRgbaColor: string | undefined, isDark: boolean) => {
  const colors: Record<string, string> = {
    '--color-primary': rgbaColor,
  }

  let preColor = rgbaColor
  for (let i = 1; i < 11; i += 1) {
    preColor = shadeColor(isDark ? 0.2 : -0.1, preColor)
    colors[`--color-primary-dark-${i * 100}`] = preColor
    for (let j = 1; j < 10; j += 1) {
      colors[`--color-primary-dark-${i * 100}-alpha-${j * 100}`] = alphaColor(0.1 * j, preColor)
      colors[`--color-primary-alpha-${j * 100}`] = alphaColor(0.1 * j, rgbaColor)
    }
  }
  preColor = rgbaColor
  for (let i = 1; i < 10; i += 1) {
    preColor = shadeColor(isDark ? -0.1 : 0.2, preColor)
    colors[`--color-primary-light-${i * 100}`] = preColor
    for (let j = 1; j < 10; j += 1) {
      colors[`--color-primary-light-${i * 100}-alpha-${j * 100}`] = alphaColor(0.1 * j, preColor)
    }
  }
  preColor = shadeColor(isDark ? -0.2 : 1, preColor)
  colors['--color-primary-light-1000'] = preColor
  for (let j = 1; j < 10; j += 1) {
    colors[`--color-primary-light-1000-alpha-${j * 100}`] = alphaColor(0.1 * j, preColor)
  }

  colors['--color-theme'] = isDark ? colors['--color-primary-light-900'] : rgbaColor

  return { ...colors, ...createFontColors(fontRgbaColor, isDark) } as unknown as AnyListen.ThemeColors
}

export const hexToRgb = (hex: string) => {
  const color = hex.replace('#', '')
  const red = Number.parseInt(color.slice(0, 2), 16)
  const green = Number.parseInt(color.slice(2, 4), 16)
  const blue = Number.parseInt(color.slice(4, 6), 16)
  return `rgb(${red}, ${green}, ${blue})`
}

export const colorToHex = (color: string, fallback: string) => {
  const match = /rgba?\((\d+),?\s+(\d+),?\s+(\d+)/.exec(color)
  if (!match) return fallback
  return `#${[match[1], match[2], match[3]]
    .map((value) => Number.parseInt(value, 10).toString(16).padStart(2, '0'))
    .join('')}`
}
