<script lang="ts">
  import { type Snippet, getAllContexts, mount, onMount, unmount } from 'svelte'

  let {
    children,
    to = document.body,
  }: {
    children: Snippet
    to?: string | HTMLElement
  } = $props()

  const context = getAllContexts()

  onMount(() => {
    const target = typeof to === 'string' ? document.querySelector(to) : to
    if (!target) return
    let instance = mount(children, { target, context })

    return () => {
      void unmount(instance)
    }
  })
</script>
