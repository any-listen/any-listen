<script lang="ts">
  import Checkbox from '@/components/base/Checkbox.svelte'
  let {
    id,
    name,
    desc,
    checked,
    onchange,
  }: {
    id: string
    name: string
    desc?: string
    checked: boolean
    onchange: (checked: boolean) => void
  } = $props()
  // let id = $derived(`${name}_${desc}_${f}`)
</script>

<div class="settings-item-checkbox">
  <Checkbox label={name} {id} {checked} {onchange} />
  {#if desc}
    <p class="settings-item-desc">{desc}</p>
  {/if}
</div>

<style lang="less">
  .settings-item-checkbox {
    :global {
      .checkbox {
        margin-bottom: 5px;
        font-size: 14px;
      }
    }
  }
  // .settings-item-title {
  //   font-size: 15px;
  // }
  .settings-item-desc {
    margin-top: -3px;
    margin-bottom: 6px;
    font-size: 12px;
    opacity: 0.7;
  }
</style>
