<script lang="ts">
  import { i18n, t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import { onMount } from 'svelte'
  import Selection from '@/components/base/Selection.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import {
    getHasMediaDevicePermission,
    getMediaDeviceIdSetting,
    getMediaDevices,
    requestMediaDevicePermission,
    saveMediaDeviceIdSetting,
  } from '@/modules/player/store/mediaDevice'
  import { showNotify } from '@/components/apis/notify'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { playerEvent } from '@/modules/player/store/event'

  let hasDevicePermission = $state(true)
  let deviceList = $state.raw<Array<{ deviceId: string; label: string }>>([])
  let mediaDeviceId = $state(getMediaDeviceIdSetting())

  onMount(() => {
    const getList = () => {
      void getMediaDevices()
        .then((devices) => {
          deviceList = devices
        })
        .finally(() => {
          hasDevicePermission = getHasMediaDevicePermission()
        })
    }
    getList()

    navigator.mediaDevices?.addEventListener('devicechange', getList)
    const unsub = playerEvent.on('mediaDeviceChanged', () => {
      const newId = getMediaDeviceIdSetting()
      if (mediaDeviceId == newId) return
      mediaDeviceId = newId
    })
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', getList)
      unsub()
    }
  })
</script>

<TitleContent name={$t('settings.player.media_device')}>
  <div class="settings-item-content">
    <div class="gap-top">
      <Selection
        itemkey="deviceId"
        itemname="label"
        value={mediaDeviceId}
        list={deviceList}
        onchange={(val) => {
          void saveMediaDeviceIdSetting(val)
        }}
      />
    </div>
    {#if import.meta.env.VITE_IS_WEB}
      {#if !hasDevicePermission}
        <div class="gap-top permission-tip">
          <p><SvgIcon name="warning" />{$t('settings.player.media_device_permission_tip')}</p>
          <div>
            <Btn
              min
              onclick={async () => {
                if (await requestMediaDevicePermission()) {
                  void getMediaDevices().then((devices) => {
                    deviceList = devices
                  })
                } else {
                  showNotify(i18n.t('settings.player.media_device_get_permission_failed'))
                }
                hasDevicePermission = getHasMediaDevicePermission()
              }}>{$t('settings.player.media_device_get_permission')}</Btn
            >
          </div>
        </div>
      {/if}
    {/if}
  </div>
</TitleContent>

<style lang="less">
  .permission-tip {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
    width: 460px;
    max-width: 100%;
    padding: 12px;
    background-color: var(--color-primary-light-300-alpha-900);
    border-radius: @radius-border;

    p {
      display: flex;
      flex-flow: row nowrap;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: var(--color-font-error);

      :global(.svg-icon) {
        flex: none;
        width: 1.6em;
        height: 1.6em;
      }
    }
  }
</style>
