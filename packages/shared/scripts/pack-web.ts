process.env.NODE_ENV = 'production'
process.env.MODE = 'web'
// process.env.VITE_CJS_TRACE = 'true'
process.env.VITE_CJS_IGNORE_WARNING = 'true'
process.env.WS_NO_BUFFER_UTIL = 'true'
process.env.WS_NO_UTF_8_VALIDATE = 'true'

void import('./bundler/pack-web')
