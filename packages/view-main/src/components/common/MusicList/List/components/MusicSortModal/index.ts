import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'

export const showMusicSortModal = async (musicInfo: AnyListen.Music.MusicInfo | null, selectedNum = 0) => {
  const App = (await import('./MusicSortModal.svelte')).default
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
  return (app.show(musicInfo, selectedNum) as Promise<number | null>).finally(() => {
    unsub()
  })
}
