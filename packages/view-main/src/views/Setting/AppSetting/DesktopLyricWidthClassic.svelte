<script lang="ts">
  import { updateSetting } from '@/modules/setting/store/action'
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import Input from '@/components/base/Input.svelte'

  let fontNum = useSettingValue('desktopLyric.classic.widthByFontNum')
</script>

<TitleContent name={$t('settings.desktopLyric.classic.width')}>
  <div class="settings-item-content">
    <div class="gap-top">
      <Input
        value={String(fontNum.val)}
        type="number"
        --width="4.25rem"
        placeholder={$t('settings.basic.font_family_default')}
        onbeforechange={(val) => {
          const valNum = parseInt(val)
          if (valNum < 6) return '6'
          if (valNum > 200) return '200'
          if (isNaN(valNum)) return fontNum.val.toString()
          return valNum.toString()
        }}
        onchange={(val) => {
          void updateSetting({ 'desktopLyric.classic.widthByFontNum': Number(val) })
        }}
      />
    </div>
    <div class="gap-top desc">
      <p class="small">{$t('settings.desktopLyric.classic.width_desc')}</p>
    </div>
  </div>
</TitleContent>
