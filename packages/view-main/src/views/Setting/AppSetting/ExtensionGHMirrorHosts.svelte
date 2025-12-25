<script lang="ts">
  import { updateSetting } from '@/modules/setting/store/action'
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import Textarea from '@/components/base/Textarea.svelte'
  import { settingState } from '@/modules/setting/store/state'
  import Btn from '@/components/base/Btn.svelte'
  import defaultSetting from '@any-listen/common/defaultSetting'
  import { formatExtensionGHMirrorHosts } from '@any-listen/common/tools'

  const formatVal = (v: string) => {
    return v.length ? `${v}\n` : v
  }
  let value = $state(formatVal(settingState.setting['extension.ghMirrorHosts']))
  const defVal = defaultSetting['extension.ghMirrorHosts']

  const handleSave = () => {
    const newVals = formatExtensionGHMirrorHosts(value.trim().split('\n')).join('\n')

    void updateSetting({
      'extension.ghMirrorHosts': newVals,
    })
    value = formatVal(newVals)
  }
</script>

<TitleContent name={$t('settings.extension.gh_mirror_hosts')} desc={$t('settings.extension.gh_mirror_hosts_desc')}>
  <div class="settings-item-content">
    <div class="gap-top code">
      <Textarea
        id="settings.extension.gh_mirror_hosts"
        {value}
        onchange={(val) => {
          value = val
        }}
        disabled={!import.meta.env.VITE_IS_DESKTOP}
        onblur={handleSave}
      />
    </div>
    {#if import.meta.env.VITE_IS_DESKTOP}
      <div class="gap-top">
        <Btn
          min
          disabled={defVal == value.trim()}
          onclick={() => {
            value = formatVal(defVal)
            void updateSetting({
              'extension.ghMirrorHosts': defVal,
            })
          }}
        >
          {$t('settings.extension.gh_mirror_hosts_reset')}
        </Btn>
      </div>
    {/if}
    {#if import.meta.env.VITE_IS_WEB}
      <div class="gap-top">
        <p class="small">{$t('settings.extension.gh_mirror_hosts_web_tip')}</p>
      </div>
    {/if}
  </div>
</TitleContent>

<style lang="less">
  .settings-item-content {
    :global {
      textarea {
        width: 100%;
        min-width: 200px;
        max-width: 500px;
        min-height: 160px;
        margin-top: 5px;
      }
    }
  }
</style>
