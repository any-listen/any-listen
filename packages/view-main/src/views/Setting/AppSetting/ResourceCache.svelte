<script lang="ts">
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import { onMount } from 'svelte'
  import { clearCache, getCacheSize } from '@/shared/ipc/app'
  import { sizeFormate } from '@/shared'
  import { showNotify } from '@/components/apis/notify'

  let resourceCacheSize = $state('0 B')

  onMount(() => {
    let mounted = true
    getCacheSize().then((size) => {
      if (!mounted) return
      resourceCacheSize = sizeFormate(size)
    })

    return () => {
      mounted = false
    }
  })
</script>

<TitleContent name={$t('settings.other.resource_cache')}>
  <div class="settings-item-content">
    <div class="gap-top">
      <p class="p">{$t('settings.other.resource_cache_label')}{resourceCacheSize}</p>
      <p class="p">
        <Btn
          min
          disabled={resourceCacheSize === '0 B'}
          onclick={async () => {
            await clearCache().catch((err: Error) => {
              console.error('Clear cache error:', err)
              showNotify($t('settings.other.clear_cache_failed', { msg: err.message }))
              throw err
            })
            resourceCacheSize = '0 B'
            showNotify($t('settings.other.clear_cache_success'))
          }}
        >
          {$t('settings.other.clear_cache')}
        </Btn>
      </p>
    </div>
  </div>
</TitleContent>
