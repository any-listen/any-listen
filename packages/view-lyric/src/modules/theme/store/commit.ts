import { themeState } from './state'

export const updateTheme = (theme: AnyListen.ThemeSetting) => {
  themeState.theme = theme
}

export const setThemePreview = (preview: boolean) => {
  themeState.themePreview = preview
}
