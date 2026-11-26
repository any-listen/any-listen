import { runScript } from './bundler/entry'

runScript({ mode: 'development', target: 'web', start: async () => import('./bundler/runner-web') })
