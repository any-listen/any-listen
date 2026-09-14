process.env.NODE_ENV = 'production'
process.env.MODE = 'desktop'
// process.env.VITE_CJS_TRACE = 'true'
process.env.VITE_CJS_IGNORE_WARNING = 'true'
process.env.WS_NO_BUFFER_UTIL = 'true'
process.env.WS_NO_UTF_8_VALIDATE = 'true'

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
    if (process.env.BUILD_WIN_LEGACY) process.env.VITE_IS_WINDOWS_LEGACY = 'true'
    break
}

process.on('SIGINT', () => {
  process.exit(0)
})
process.on('SIGTERM', () => {
  process.exit(0)
})

void import('./bundler/pack-desktop')
