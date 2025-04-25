import { mount, tick, unmount } from 'svelte'

import { onDesconnected } from '@/modules/app/shared'
import UpdateModal from './UpdateModal.svelte'

let isShowModal = false
export const showUpdateModal = async () => {
  if (isShowModal) return
  isShowModal = true
  const app = mount(UpdateModal, {
    target: document.getElementById('root')!,
    props: {
      onafterleave() {
        void unmount(app, { outro: true })
        isShowModal = false
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
