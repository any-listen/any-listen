<script lang="ts">
  import { tick, type ComponentExports } from 'svelte'

  import Btn from '@/components/base/Btn.svelte'
  import Input from '@/components/base/Input.svelte'
  import Modal from '@/components/material/Modal.svelte'
  import { t } from '@/plugins/i18n'

  let {
    onafterleave,
  }: {
    onafterleave?: () => void
  } = $props()

  let visible = $state(false)
  let musicInfo = $state.raw<AnyListen.Music.MusicInfo | null>(null)
  let selectedNum = $state(0)

  let input = $state<ComponentExports<typeof Input> | null>(null)
  let sortNum = $state('')
  let resolveShow: ((num: number | null) => void) | null = null

  const handleClose = () => {
    resolveShow?.(null)
    resolveShow = null
    visible = false
  }

  const verify = () => {
    const num = /^[1-9]\d*/.exec(sortNum)
    const value = num ? parseInt(num[0]) : ''
    sortNum = value.toString()
    return value
  }

  const handleSubmit = () => {
    const num = verify()
    if (sortNum == '') return
    resolveShow?.(num as number)
    resolveShow = null
    visible = false
  }

  $effect(() => {
    if (visible) {
      sortNum = ''
      void tick().then(() => {
        input?.focus()
      })
      return
    }
    musicInfo = null
    selectedNum = 0
    sortNum = ''
  })

  export const hide = () => {
    handleClose()
  }

  export const show = async (_musicInfo: AnyListen.Music.MusicInfo | null, _selectedNum = 0) => {
    resolveShow?.(null)
    resolveShow = null
    musicInfo = _musicInfo
    selectedNum = _selectedNum
    visible = true
    return new Promise<number | null>((resolve) => {
      resolveShow = resolve
    })
  }
</script>

<Modal bind:visible teleport="#view" minheight="0" onclose={handleClose} {onafterleave}>
  <main class="main">
    <h2>
      {#if selectedNum > 0}
        {$t('music_sort.title_multiple', { num: selectedNum })}
      {:else}
        {$t('music_sort.title', { name: musicInfo ? musicInfo.name : '' })}
      {/if}
    </h2>

    <Input
      bind:this={input}
      bind:value={sortNum}
      class="input"
      type="number"
      placeholder={$t('music_sort.input_tip')}
      onsubmit={handleSubmit}
      onblur={() => {
        verify()
      }}
    />

    <div class="footer">
      <Btn class={['btn']} onclick={handleSubmit}>{$t('btn_confirm')}</Btn>
    </div>
  </main>
</Modal>

<style lang="less">
  .main {
    display: flex;
    flex-flow: column nowrap;
    min-width: 280px;
    max-width: 530px;
    min-height: 0;
    padding: 0 15px;

    h2 {
      padding: 15px 0 8px;
      font-size: 13px;
      line-height: 1.3;
      color: var(--color-font);
      word-break: break-all;
    }

    :global {
      .btn {
        min-width: 70px;

        + .btn {
          margin-left: 10px;
        }
      }
    }
  }
  .footer {
    margin: 20px 0 15px auto;
  }
</style>
