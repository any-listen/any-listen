import { runScript } from './bundler/entry'

runScript({
  mode: 'production',
  target: 'desktop',
  legacyWindows: true,
  start: async () => import('./bundler/pack-desktop'),
})
