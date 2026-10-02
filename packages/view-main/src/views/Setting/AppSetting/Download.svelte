<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import Checkbox from '@/components/base/Checkbox.svelte'
  import Radio from '@/components/base/Radio.svelte'
  import Selection from '@/components/base/Selection.svelte'
  import { showSimpleConfirmModal } from '@/components/apis/dialog'
  import { locateDownloadDirectory, selectDownloadDirectory, runDownloadAction } from '@/modules/download/actions'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { updateSetting } from '@/modules/setting/store/action'
  import { i18n, t, type Message } from '@/plugins/i18n'

  const DOWNLOAD_LIMITS = {
    MAX_CONCURRENCY: 6,
    CONCURRENCY_CONFIRM_THRESHOLD: 3,
  } as const

  const downloadEnabled = useSettingValue('download.enable')
  const skipExisting = useSettingValue('download.skipExistFile')
  const groupByListName = useSettingValue('download.isSavePathGroupByListName')
  const downloadPath = useSettingValue('download.savePath')
  const maxDownloadNum = useSettingValue('download.maxDownloadNum')
  const fileName = useSettingValue('download.fileName')
  const downloadLrc = useSettingValue('download.isDownloadLrc')
  const downloadTLrc = useSettingValue('download.isDownloadTLrc')
  const downloadRLrc = useSettingValue('download.isDownloadRLrc')
  const downloadLxLrc = useSettingValue('download.isDownloadLxLrc')
  const lrcFormat = useSettingValue('download.lrcFormat')
  const names = [
    { value: '%name% - %singer%', label: 'download.name_singer' },
    { value: '%singer% - %name%', label: 'download.singer_name' },
    { value: '%name%', label: 'download.name_only' },
  ] as const
  const formats = ['utf8', 'gbk'] as const
  const save = <K extends keyof AnyListen.AppSetting>(key: K, value: AnyListen.AppSetting[K]) =>
    runDownloadAction(() => updateSetting({ [key]: value }))
  const setConcurrency = async (value: number) => {
    if (value > DOWNLOAD_LIMITS.CONCURRENCY_CONFIRM_THRESHOLD && !(await showSimpleConfirmModal(i18n.t('download.concurrency_tip')))) return
    await save('download.maxDownloadNum', value)
  }
</script>

{#snippet heading(name: keyof Message, description?: keyof Message)}
  <h4 class="heading">
    {$t(name)}
    {#if description}
      <svg class="help" viewBox="0 0 24 24" role="img" aria-label={$t(description)}>
        <title>{$t(description)}</title>
        <use xlink:href="#icon-help" />
      </svg>
    {/if}
  </h4>
{/snippet}

<div class="download-settings">
  <div class="section">
    <Checkbox
      id="setting-download-enable"
      checked={downloadEnabled.val}
      label={$t('download.enable')}
      onchange={(value) => save('download.enable', value)}
    />
    <Checkbox
      id="setting-download-skip-existing"
      checked={skipExisting.val}
      label={$t('download.skip_existing')}
      onchange={(value) => save('download.skipExistFile', value)}
    />
    <Checkbox
      id="setting-download-group-by-list"
      checked={groupByListName.val}
      label={$t('download.group_by_list')}
      onchange={(value) => save('download.isSavePathGroupByListName', value)}
    />
  </div>
  <div class="section" aria-label={$t('download.path_description')}>
    {@render heading('download.save_directory')}
    <p class="path-row">
      <span>{$t('download.path_label')}</span>
      <button
        type="button"
        class="path"
        aria-label={$t('download.path_open')}
        disabled={!downloadPath.val}
        onclick={() => locateDownloadDirectory(downloadPath.val)}
      >
        {downloadPath.val || $t('download.directory_unset')}
      </button>
    </p>
    {#if import.meta.env.VITE_IS_WEB}
      <p class="server-tip">{$t('download.server_tip')}</p>
    {/if}
    <div>
      <Btn min onclick={selectDownloadDirectory}>{$t('download.path_change')}</Btn>
    </div>
  </div>
  <div class="section">
    {@render heading('download.concurrency', 'download.concurrency_description')}
    <div class="concurrency">
      <Selection
        value={maxDownloadNum.val}
        list={Array.from({ length: DOWNLOAD_LIMITS.MAX_CONCURRENCY }, (_, i) => ({ id: i + 1, label: String(i + 1) }))}
        itemkey="id"
        itemname="label"
        onchange={setConcurrency}
      />
    </div>
  </div>
  <div class="section" aria-label={$t('download.name_description')}>
    {@render heading('download.file_name')}
    <div class="options" role="radiogroup" aria-label={$t('download.file_name')}>
      {#each names as item (item.value)}
        <Radio
          id={`setting-download-name-${item.label}`}
          name="setting-download-name"
          value={item.value}
          checked={fileName.val === item.value}
          label={$t(item.label)}
          onselect={(value) => save('download.fileName', value)}
        />
      {/each}
    </div>
  </div>
  <div class="section" aria-label={$t('download.lyric_description')}>
    {@render heading('download.lyric_file')}
    <Checkbox
      id="setting-download-save-lyric"
      checked={downloadLrc.val}
      label={$t('download.enabled')}
      onchange={(value) => save('download.isDownloadLrc', value)}
    />
    <Checkbox
      id="setting-download-save-translation"
      checked={downloadTLrc.val}
      disabled={!downloadLrc.val}
      label={$t('download.save_translation')}
      onchange={(value) => save('download.isDownloadTLrc', value)}
    />
    <Checkbox
      id="setting-download-save-romanization"
      checked={downloadRLrc.val}
      disabled={!downloadLrc.val}
      label={$t('download.save_romanization')}
      onchange={(value) => save('download.isDownloadRLrc', value)}
    />
    <Checkbox
      id="setting-download-save-word-lyric"
      checked={downloadLxLrc.val}
      disabled={!downloadLrc.val}
      label={$t('download.save_word_lyric')}
      onchange={(value) => save('download.isDownloadLxLrc', value)}
    />
  </div>
  <div class="section">
    {@render heading('download.lyric_encoding', 'download.encoding_description')}
    <div class="options" role="radiogroup" aria-label={$t('download.lyric_encoding')}>
      {#each formats as format (format)}
        <Radio
          id={`setting-download-encoding-${format}`}
          name="setting-download-encoding"
          value={format}
          checked={lrcFormat.val === format}
          label={format === 'utf8' ? 'UTF-8' : 'GBK'}
          onselect={(value) => save('download.lrcFormat', value)}
        />
      {/each}
    </div>
  </div>
</div>

<style lang="less">
  .download-settings {
    display: flex;
    flex-flow: column;
    gap: 24px;
    padding: 8px 0;
  }
  .section {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    gap: 12px;
  }
  .heading {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
  }
  .help {
    width: 16px;
    height: 16px;
  }
  .path-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: baseline;
    max-width: 100%;
    font-size: 14px;
  }
  .path {
    padding: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
    background: transparent;
    border: none;
    user-select: text;
  }
  .path:hover:enabled {
    text-decoration: underline;
  }
  .path:disabled {
    cursor: default;
  }
  .server-tip {
    font-size: 12px;
    opacity: 0.7;
  }
  .concurrency {
    width: 60px;
    margin-left: 16px;
  }
  .options {
    display: flex;
    flex-flow: row wrap;
    gap: 20px;
    margin-left: 16px;
    font-size: 14px;
  }
</style>
