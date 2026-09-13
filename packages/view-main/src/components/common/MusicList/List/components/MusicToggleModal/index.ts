import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'

export const showMusicToggleModal = async (musicInfo: AnyListen.Music.MusicInfo, listId: string) => {
  const App = (await import('./MusicToggleModal.svelte')).default
  const app = mount(App, {
    target: document.getElementById('root')!,
    props: {
      onafterleave() {
        void unmount(app, { outro: true })
      },
    },
  })
  const release = () => {
    app.hide()
    unsub()
  }
  const unsub = onDesconnected(release)
  await tick()
  app.show(musicInfo, listId)
}
