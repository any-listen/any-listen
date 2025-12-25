<script lang="ts">
  import { showUpdateModal } from '@/components/apis/updateModal'
  import Btn from '@/components/base/Btn.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { useDownloadProgress, useVersionInfo } from '@/modules/version/reactive.svelte'
  import { t } from '@/plugins/i18n'
  import { dateFormat, sizeFormate } from '@/shared'
  import { openDevTools } from '@/shared/ipc/app'
  let versionInfo = useVersionInfo()
  let progress = useDownloadProgress()
  const allowPreRelease = useSettingValue('common.allowPreRelease')

  let lastClickTime = 0
  let clickNum = 0
  // const commit_id = import.meta.env.VITE_COMMIT_ID
  let commitId = $derived(versionInfo.val.commit)
  let commitDate = $derived(dateFormat(versionInfo.val.commitDate))
  const handleOpenDevTools = () => {
    if (window.performance.now() - lastClickTime > 1000) {
      if (clickNum > 0) clickNum = 0
    } else if (clickNum > 4) {
      void openDevTools()
      clickNum = 0
      return
    }
    clickNum++
    lastClickTime = window.performance.now()
  }

  const downloadProgress = $derived(
    versionInfo.val.status == 'downloading'
      ? progress.val?.percent
        ? `${progress.val.percent.toFixed(2)}% - ${sizeFormate(progress.val.transferred)}/${sizeFormate(progress.val.total)} - ${sizeFormate(progress.val.bytesPerSecond)}/s`
        : $t('settings.update.init')
      : ''
  )

  const latestVersion = $derived(
    versionInfo.val.newVersion?.beta && allowPreRelease.val
      ? versionInfo.val.newVersion.beta[0].version
      : versionInfo.val.newVersion?.version
  )
</script>

<div class="settings-item-content update-content">
  <div class="gap-top">
    {#if import.meta.env.VITE_IS_DESKTOP}
      <div class="p small" role="presentation" onclick={handleOpenDevTools}>
        {$t('settings.update.current_label')}{versionInfo.val.version}
      </div>
    {/if}
    {#if import.meta.env.VITE_IS_WEB}
      <div class="p small">
        {$t('settings.update.current_label')}{versionInfo.val.version}
      </div>
    {/if}
    {#if commitId}
      <div class="p small">{$t('settings.update.commit_id')}<span class="select">{commitId}</span></div>
    {/if}
    {#if commitDate}
      <div class="p small">{$t('settings.update.commit_date')}<span class="select">{commitDate}</span></div>
    {/if}
  </div>
  <div class="p small gap-top">
    {$t('settings.update.latest_label')}{versionInfo.val.newVersion && latestVersion != '0.0.0'
      ? latestVersion
      : $t('settings.update.unknown')}
  </div>
  {#if downloadProgress}
    <div class="p small" style="line-height: 1.5;">
      {$t('settings.update.downloading')}<br />{$t('settings.update.progress')}{downloadProgress}
    </div>
  {/if}
  {#if versionInfo.val.newVersion}
    {#if versionInfo.val.isLatest}
      <div class="p"><span>{$t('settings.update.latest')}</span></div>
    {:else if versionInfo.val.isUnknown}
      <div class="p"><span>{$t('settings.update.unknown_tip')}</span></div>
    {:else if versionInfo.val.status != 'downloading'}
      <div class="p"><span>{$t('settings.update.new_version')}</span></div>
    {/if}
    <div class="p">
      <Btn min onclick={showUpdateModal}>
        {$t('settings.update.open_version_modal_btn')}
      </Btn>
    </div>
  {:else if versionInfo.val.status == 'checking'}
    <div class="p small">{$t('settings.update.checking')}</div>
  {/if}
</div>

<style lang="less">
  .update-content {
    margin-top: 5px;
  }
</style>
