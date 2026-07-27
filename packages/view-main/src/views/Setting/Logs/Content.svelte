<script lang="ts">
  import { tick } from 'svelte'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
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
    {@attach verticalScrollbar({ offset: '0' })}
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
    <pre class="code select">{@html highlightLog}</pre>
  </div>
</div>

<style lang="less">
  .log-main {
    display: flex;
    flex: auto;
    min-height: 0;
    overflow: hidden;
    background-color: var(--color-primary-light-900-alpha-700);
    border-radius: @radius-border;
  }
  .log-content {
    flex: auto;

    pre {
      padding: 2px 4px;
      font-size: 12px;
      line-height: 1.5;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
  }
</style>
