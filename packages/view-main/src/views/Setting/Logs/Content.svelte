<script lang="ts">
  import { tick } from 'svelte'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar'
  import { highlightCode } from '@/shared/highlight'
  import '@/assets/styles/highlight.less'
  /* eslint svelte/no-at-html-tags: "off" */

  let {
    log,
    isBottom = $bindable(),
  }: {
    log: string
    isBottom: boolean
  } = $props()

  let domLogContent = $state<HTMLElement | null>(null)
  let highlightLog = $derived(highlightCode(log, 'log'))
  export const toBottom = (isAnimation = true) => {
    void tick().then(() => {
      isBottom ||= true
      if (domLogContent) {
        domLogContent.scrollTo({
          top: domLogContent.scrollHeight,
          behavior: isAnimation ? 'smooth' : 'auto',
        })
      }
    })
  }
</script>

<div class="log-main">
  <div
    class="log-content"
    use:verticalScrollbar={{ offset: '0' }}
    bind:this={domLogContent}
    onscroll={(event) => {
      const target = event.target as HTMLElement
      if (target.scrollHeight - target.scrollTop === target.clientHeight) {
        isBottom ||= true
      } else {
        isBottom &&= false
      }
    }}
  >
    <pre class="code">{@html highlightLog}</pre>
  </div>
</div>

<style lang="less">
  .log-main {
    flex: auto;
    min-height: 0;
    display: flex;
    border-radius: @radius-border;
    background-color: var(--color-primary-light-900-alpha-700);
    overflow: hidden;
  }
  .log-content {
    flex: auto;

    pre {
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
      user-select: text;
      padding: 2px 4px;
    }
  }
</style>
