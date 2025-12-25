<script lang="ts">
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import { onMount } from 'svelte'
  import { showNotify } from '@/components/apis/notify'
  import { getMusicUrlCount, clearMusicUrl, clearMusicLyric, getMusicLyricCount } from '@/shared/ipc/music'

  let musicUrlCacheSize = $state(0)
  let musicLyricCacheSize = $state(0)

  onMount(() => {
    let mounted = true
    void getMusicUrlCount().then((count) => {
      if (!mounted) return
      musicUrlCacheSize = count
    })
    void getMusicLyricCount().then((count) => {
      if (!mounted) return
      musicLyricCacheSize = count
    })

    return () => {
      mounted = false
    }
  })
</script>

<TitleContent name={$t('settings.other.music_cache')}>
  <div class="settings-item-content">
    <div class="gap-top">
      <p class="p">{$t('settings.other.music_url_cache')}{musicUrlCacheSize}</p>
      <p class="p">{$t('settings.other.music_lyric_cache')}{musicLyricCacheSize}</p>
      <p class="p">
        <Btn
          min
          disabled={!musicUrlCacheSize}
          onclick={async () => {
            await clearMusicUrl().catch((err: Error) => {
              console.error('Clear cache error:', err)
              showNotify($t('settings.other.clear_cache_failed', { msg: err.message }))
              throw err
            })
            musicUrlCacheSize = 0
            showNotify($t('settings.other.clear_cache_success'))
          }}
        >
          {$t('settings.other.clear_music_url_cache')}
        </Btn>
        <Btn
          min
          disabled={!musicLyricCacheSize}
          onclick={async () => {
            await clearMusicLyric().catch((err: Error) => {
              console.error('Clear cache error:', err)
              showNotify($t('settings.other.clear_cache_failed', { msg: err.message }))
              throw err
            })
            musicLyricCacheSize = 0
            showNotify($t('settings.other.clear_cache_success'))
          }}
        >
          {$t('settings.other.clear_music_lyric_cache')}
        </Btn>
      </p>
    </div>
  </div>
</TitleContent>
