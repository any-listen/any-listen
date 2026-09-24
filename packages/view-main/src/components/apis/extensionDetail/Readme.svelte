<script lang="ts">
  import Loading from '@/components/base/Loading.svelte'
  import { extT } from '@/modules/extension/i18n'
  import { verticalScrollbar } from '@/shared/compositions/verticalScrollbar.svelte'
  import { openUrl } from '@/shared/ipc/app'
  import { parseMarkdown } from '@/shared/tools'
  /* eslint svelte/no-at-html-tags: "off" */
  let { ext }: { ext: AnyListen.Extension.Extension | AnyListen.IPCExtension.RemoteOnlineDetail } = $props()

  let readmeHtml = $state<string | null>(null)
  let error = $state('')

  const handleReadmeLinkClick = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    const target = event.target as HTMLElement
    if (target.tagName === 'A' && (target as HTMLLinkElement).href) {
      void openUrl((target as HTMLLinkElement).href)
    }
  }

  $effect(() => {
    const markdown = ext.readme
    if (!markdown) {
      readmeHtml = null
      return
    }
    let unmounted = false
    readmeHtml = null
    error = ''
    void parseMarkdown(markdown)
      .then((parsed) => {
        if (unmounted) return
        readmeHtml = parsed
      })
      .catch((err) => {
        if (unmounted) return
        error = err.message
      })
    return () => {
      unmounted = true
    }
  })
</script>

<div class="readme" {@attach verticalScrollbar({ offset: '0.22rem' })}>
  {#if ext.description}
    <p class="description">{$extT(ext.id, ext.description)}</p>
  {/if}
  {#if ext.readme}
    <Loading loading={readmeHtml == null} error={!!error} errorMessage={error} />
    {#if readmeHtml != null}
      <div class="readme-content" role="presentation" onclick={handleReadmeLinkClick}>{@html readmeHtml}</div>
    {/if}
  {/if}
</div>

<style lang="less">
  .readme {
    flex: auto;
    flex-flow: column nowrap;
    // width: 80%;
    min-height: 0;
    padding-right: 10px;
  }

  .description {
    padding-left: 8px;
    margin: 0;
    font-size: 0.9em;
    line-height: 1.5;
    color: var(--color-font-label);
    overflow-wrap: anywhere;
    border-left: 5px solid var(--color-border);
  }

  .readme-content {
    margin-top: 10px;
    overflow: hidden;
    font-size: 0.875em;
    user-select: text;
    :global {
      * {
        user-select: text;
      }
      h1,
      h2,
      h3,
      h4 {
        margin: 0.5em 0;
        font-weight: bold;
        line-height: 1.25;
      }

      h1 {
        font-size: 1.5em;
      }

      h2 {
        font-size: 1.25em;
      }

      h3 {
        font-size: 1.1em;
      }

      h5,
      h6 {
        margin: 0.25em 0;
        font-weight: bold;
        line-height: 1.25;
      }

      p {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        font-size: 14px;
        line-height: 1.5;
      }

      code {
        padding: 0.1em 0.4em;
        margin: 0;
        font-size: 85%;
        white-space: break-spaces;
        background-color: var(--color-primary-background);
        border: 1px solid var(--color-primary-background-hover);
        border-radius: 3px;
      }

      .mac code {
        font-family: 'SF Mono', monaco, menlo, courier, monospace;
      }

      .windows code {
        font-family: consolas, 'Courier New', monospace;
      }

      .linux code {
        font-family: 'Ubuntu Mono', 'Liberation Mono', 'DejaVu Sans Mono', 'Courier New', monospace;
      }

      pre {
        padding: 0.65em 0.75em;
        margin: 0.6em 0;
        overflow: auto;
        background: var(--color-primary-dark-200-alpha-900);
        border-radius: 6px;
      }

      pre code {
        padding: 0;
        font-size: 1em;
        white-space: pre;
        background: none;
        border: none;
        border-radius: 0;
      }

      ul {
        padding-left: 2em;
        margin-top: 0;
        margin-bottom: 1em;
        list-style: disc;
      }

      ol {
        padding-left: 2em;
        margin-top: 0;
        margin-bottom: 1em;
        list-style: decimal;
      }

      li + li {
        margin-top: 0.25em;
      }

      blockquote {
        padding-left: 0.8em;
        margin: 0 0 1em;
        font-style: italic;
        color: var(--color-primary-font);
        border-left: 4px solid var(--color-primary-background-hover);
      }

      em {
        font-style: italic;
      }

      strong {
        font-weight: bold;
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
      }

      hr {
        margin: 1em 0;
        border: 0;
        border-top: 1px solid var(--color-border);
      }
    }
  }
</style>
