<script lang="ts">
  import { updateSetting } from '@/modules/setting/store/action'
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import { onMount } from 'svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import Selection from '@/components/base/Selection.svelte'
  import Input from '@/components/base/Input.svelte'
  import { getSystemFonts } from '@/shared/ipc/app'

  let font = useSettingValue('common.font')
  let fonts = $derived.by(() => {
    if (!font.val) return ['', '']
    let [f1 = '', f2 = ''] = font.val.split(',')
    return [f1.trim(), f2.trim()]
  })
  let systemFontList = $state.raw<Array<{ value: string; label: string }>>([])
  let fontList = $derived([{ value: '', label: $t('settings.basic.font_family_default') }, ...systemFontList])
  let fontSize = useSettingValue('common.fontSize')
  const fontSizeList = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  const updateFonts = (font1: string, font2: string) => {
    let font: string[] = []
    if (font1) font.push(font1)
    if (font2) font.push(font2)
    void updateSetting({ 'common.font': font.join(', ') })
  }

  onMount(() => {
    if (import.meta.env.VITE_IS_DESKTOP) {
      let mounted = true
      void getSystemFonts().then((list) => {
        if (mounted && list.length) {
          systemFontList = list.map((f) => ({ value: f, label: f.replace(/(?:^"|"$)/g, '') }))
        }
      })
      return () => {
        mounted = false
      }
    }
  })
</script>

<TitleContent name={$t('settings.basic.font')}>
  <div class="settings-item-content">
    <div class="settings-item-content-item">
      {#if import.meta.env.VITE_IS_DESKTOP}
        <span>{$t('settings.basic.font_family')}</span>
        <Selection
          --selection-width="11rem"
          itemkey="value"
          itemname="label"
          value={fonts[0]}
          list={fontList}
          onchange={(val) => {
            updateFonts(val, fonts[1])
          }}
        />
        {#if font.val}
          <Selection
            --selection-width="11rem"
            itemkey="value"
            itemname="label"
            value={fonts[1]}
            list={fontList}
            onchange={(val) => {
              updateFonts(fonts[0], val)
            }}
          />
        {/if}
      {:else}
        <Input
          value={font.val}
          placeholder={$t('settings.basic.font_family_default')}
          onchange={(val) => {
            void updateSetting({ 'common.font': val })
          }}
        />
      {/if}
    </div>
    {#if import.meta.env.VITE_IS_DESKTOP}
      <div class="settings-item-content-item">
        <span>{$t('settings.basic.font_size')}</span>
        <Selection
          --selection-width="3.75rem"
          itemkey="value"
          itemname="label"
          value={fontSize.val}
          list={fontSizeList.map((n) => ({ label: String(n), value: n }))}
          onchange={(val) => {
            void updateSetting({ 'common.fontSize': val })
          }}
        />
      </div>
    {/if}
  </div>
</TitleContent>

<style lang="less">
  .settings-item-content {
    display: flex;
    flex-flow: row wrap;
    gap: 25px;
    align-items: center;
    padding-top: 5px;

    // :global(input) {
    //   height: 28px;
    //   padding: 0 4px;
    // }
  }
  .settings-item-content-item {
    display: flex;
    flex-flow: row nowrap;
    gap: 6px;
    align-items: center;
  }
</style>
