<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import { i18n, t } from '@/plugins/i18n'
  import { showOpenDialog } from '@/shared/ipc/app'
  import { downloadAndParseExtension, installExtension, updateExtension } from '@/modules/extension/store/actions'
  import { EXTENSION } from '@any-listen/common/constants'
  import { showNotify } from '@/components/apis/notify'
  import { extensionState } from '@/modules/extension/store/state'

  const handleInstallLocal = async () => {
    const { canceled, filePaths } = await showOpenDialog({
      title: i18n.t('extension.select_local_file'),
      properties: ['openFile'],
      filters: [
        // https://support.google.com/chromebook/answer/183093
        // 3gp, .avi, .mov, .m4v, .m4a, .mp3, .mkv, .ogm, .ogg, .oga, .webm, .wav
        { name: 'ALIX File', extensions: [EXTENSION.pkgExtName] },
      ],
    })
    if (canceled || !filePaths.length) return
    const path = filePaths[0]
    const info = await downloadAndParseExtension(path).catch((e: Error) => {
      console.error(e)
      showNotify(i18n.t('extension__install_local_failed', { msg: e.message }))
      throw e
    })
    const targetExt = extensionState.extensionList.find((ext) => ext.id === info.id)
    if (targetExt) {
      if (targetExt.publicKey != info.publicKey) {
        showNotify(i18n.t('extension.install_local_failed.public_key_not_match'))
        return
      }
      await updateExtension(info).catch((e: Error) => {
        console.error(e)
        showNotify(i18n.t('extension__install_local_failed', { msg: e.message }))
        throw e
      })
    } else {
      await installExtension(info).catch((e: Error) => {
        console.error(e)
        showNotify(i18n.t('extension__install_local_failed', { msg: e.message }))
        throw e
      })
    }
    showNotify(i18n.t('extension__install_local_success'))
  }
</script>

<div class="header-actions">
  <Btn onclick={handleInstallLocal} min>{$t('extension.header.actions.install_local')}</Btn>
</div>

<style lang="less">
  .header-actions {
    flex: none;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
</style>
