import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'

let isShowModal = false
export const showUpdateModal = async () => {
  const UpdateModal = (await import('./UpdateModal.svelte')).default
  if (isShowModal) return
  isShowModal = true
  const app = mount(UpdateModal, {
    target: document.getElementById('root')!,
    props: {
      onafterleave() {
        void unmount(app, { outro: true })
        isShowModal = false
        unsub()
      },
    },
  })
  const unsub = onDesconnected(() => {
    app.setVisible(false)
    unsub()
  })
  await tick()
  app.setVisible(true)
}
