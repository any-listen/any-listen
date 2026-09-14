interface ImportMetaEnv {
  readonly VITE_IS_WEB?: string
  readonly VITE_IS_DESKTOP?: string
  readonly VITE_IS_MAC?: string
  readonly VITE_IS_WINDOWS?: string
  readonly VITE_IS_WINDOWS_LEGACY?: string
  readonly VITE_IS_LINUX?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
