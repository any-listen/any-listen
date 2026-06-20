<script lang="ts">
  import { updateSetting } from '@/modules/setting/store/action'
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import { onMount } from 'svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import Selection from '@/components/base/Selection.svelte'
  import Input from '@/components/base/Input.svelte'
  import { getSystemFonts } from '@/shared/ipc/app'

  let font = useSettingValue('desktopLyric.style.font')
  let fonts = $derived.by(() => {
    if (!font.val) return ['', '']
    let [f1 = '', f2 = ''] = font.val.split(',')
    return [f1.trim(), f2.trim()]
  })
  let systemFontList = $state.raw<Array<{ value: string; label: string }>>([])
  let fontList = $derived([{ value: '', label: $t('settings.basic.font_family_default') }, ...systemFontList])
  let fontSize = useSettingValue('desktopLyric.style.fontSize')
  const updateFonts = (font1: string, font2: string) => {
    let font: string[] = []
    if (font1) font.push(font1)
    if (font2) font.push(font2)
    void updateSetting({ 'desktopLyric.style.font': font.join(', ') })
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
    <div class="settings-item-content-item font">
      <span>{$t('settings.basic.font_size')}</span>
      <Input
        value={String(fontSize.val)}
        type="number"
        placeholder={$t('settings.basic.font_family_default')}
        onbeforechange={(val) => {
          const valNum = parseInt(val)
          if (valNum < 10) return '10'
          if (valNum > 100) return '100'
          if (isNaN(valNum)) return fontSize.val.toString()
          return valNum.toString()
        }}
        onchange={(val) => {
          void updateSetting({ 'desktopLyric.style.fontSize': Number(val) })
        }}
      />
    </div>
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

    &.font {
      :global(.input) {
        width: 68px;
      }
    }
  }
</style>
