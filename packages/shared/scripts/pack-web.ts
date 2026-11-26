import { runScript } from './bundler/entry'

runScript({ mode: 'production', target: 'web', start: async () => import('./bundler/pack-web') })
