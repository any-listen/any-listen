export const parseMarkdown = async (content: string) => {
  if (!content) return ''
  const { marked } = await import('marked')
  try {
    // eslint-disable-next-line no-misleading-character-class
    return marked.parse(content.replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF]/g, ''), {
      breaks: true,
    }) as string
  } catch (err) {
    console.error('Markdown parsing error:', err)
    return null
  }
}

export const parseMarkdowns = async (contents: string[]) => {
  return Promise.all(contents.map(async (content) => parseMarkdown(content)))
}

const timers = new Map<string, number>()
export const runTimeout = (id: string, cb: () => void, delay?: number) => {
  const timer = setTimeout(() => {
    timers.delete(id)
    cb()
  }, delay)
  timers.set(id, timer)
}
export const stopTimeout = (id: string) => {
  const timer = timers.get(id)
  if (!timer) return
  clearTimeout(timer)
  timers.delete(id)
}
