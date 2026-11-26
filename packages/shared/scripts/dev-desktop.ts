import { runScript } from './bundler/entry'

runScript({ mode: 'development', target: 'desktop', start: async () => import('./bundler/runner-desktop') })
