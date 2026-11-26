type ScriptMode = 'development' | 'production'
type ScriptTarget = 'desktop' | 'web'

interface ScriptOptions {
  mode: ScriptMode
  target: ScriptTarget
  start: () => Promise<unknown>
  legacyWindows?: boolean
}

export const runScript = ({ mode, target, start, legacyWindows = false }: ScriptOptions) => {
  process.env.NODE_ENV = mode
  process.env.MODE = target
  process.env.VITE_CJS_IGNORE_WARNING = 'true'
  process.env.WS_NO_BUFFER_UTIL = 'true'
  process.env.WS_NO_UTF_8_VALIDATE = 'true'

  if (target === 'desktop') {
    switch (process.platform) {
      case 'darwin':
        process.env.VITE_IS_MAC = 'true'
        break
      case 'linux':
        process.env.VITE_IS_LINUX = 'true'
        break
      case 'win32':
      default:
        process.env.VITE_IS_WINDOWS = 'true'
        if (legacyWindows && process.env.BUILD_WIN_LEGACY) process.env.VITE_IS_WINDOWS_LEGACY = 'true'
        break
    }
  }

  process.on('SIGINT', () => process.exit(0))
  process.on('SIGTERM', () => process.exit(0))

  void start()
}
