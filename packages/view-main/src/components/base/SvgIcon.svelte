<script lang="ts">
  let { name }: { name: string } = $props()

  let id = $derived(`#icon-${name}`)
</script>

<svg class="svg-icon" aria-hidden="true">
  <use xlink:href={id} />
</svg>

<style>
  .svg-icon {
    width: 1.2em;
    height: 1.2em;
    vertical-align: -0.25em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
