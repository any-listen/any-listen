export interface InitState {
  theme: AnyListen.ThemeSetting
  themePreview: boolean
}

const empty = {}
export const themeState: InitState = {
  theme: empty as AnyListen.ThemeSetting,
  themePreview: false,
}
