<script lang="ts">
  import Icons from '@/components/layout/Icons.svelte'
  import AppLayout from '@/components/layout/index.svelte'
  import Loading from '@/components/layout/Loading.svelte'
  import { useAppAeady } from '@/modules/app/reactive.svelte'
  import { onMount } from 'svelte'
  import { useSettingValue } from './modules/setting/reactive.svelte'
  import usePauseHide from './shared/compositions/usePauseHide.svelte'
  import useHoverHide from './shared/compositions/useHoverHide.svelte'

  const appReady = useAppAeady()

  const lock = useSettingValue('desktopLyric.isLock')
  const pauseHide = usePauseHide()
  const hoverHide = useHoverHide()

  onMount(() => {
    document.getElementById('root')!.style.display = 'block'
  })
</script>

<div id="container" class="view-container" class:lock={lock.val} class:hide={pauseHide.val || hoverHide.val}>
  <Icons />
  <div id="main">
    {#if import.meta.env.VITE_IS_DESKTOP}
      {#if appReady.appAeady}
        <AppLayout />
      {/if}
    {/if}
    {#if import.meta.env.VITE_IS_WEB}
      {#if appReady.appAeady}
        <AppLayout />
      {:else}
        <Loading />
      {/if}
    {/if}
  </div>
</div>
