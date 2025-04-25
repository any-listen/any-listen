<script lang="ts">
  import { clipboardReadText } from '@/shared/ipc/app'
  import { onMount, tick } from 'svelte'
  import type { FocusEventHandler, HTMLInputTypeAttribute, KeyboardEventHandler } from 'svelte/elements'
  let {
    min = false,
    placeholder = '',
    disabled = false,
    readonly = false,
    value = $bindable(''),
    type = 'text',
    id,
    trim = false,
    stopcontenteventpropagation = true,
    autopaste = true,
    onchange = () => {},
    onsubmit = () => {},
    onkeydown = () => {},
    onblur = () => {},
    autofocus = false,
  }: {
    id?: string
    class?: string
    min?: boolean
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    value?: string
    type?: HTMLInputTypeAttribute
    trim?: boolean
    stopcontenteventpropagation?: boolean
    autopaste?: boolean
    autofocus?: boolean
    onchange?: (val: string) => void
    onsubmit?: (val: string) => void
    onkeydown?: KeyboardEventHandler<HTMLInputElement>
    onblur?: FocusEventHandler<HTMLInputElement>
  } = $props()

  let domInput: HTMLInputElement

  const handleInput = (event: Event) => {
    if (readonly) {
      domInput.value = value
      return
    }
    let newValue = domInput.value
    if (trim) {
      newValue = newValue.trim()
      domInput.value = newValue
    }
    value = newValue
  }
  const handleKeyup = (event: KeyboardEvent) => {
    if (event.key != 'enter') return
    onsubmit(domInput.value.trim())
  }
  export const focus = () => {
    domInput.focus()
  }
  const handleContextMenu = async (event: Event) => {
    if (stopcontenteventpropagation) event.stopPropagation()
    if (!autopaste || readonly) return
    if (domInput.selectionStart === null) return
    let str = await clipboardReadText()
    str = str.trim()
    str = str.replace(/\t|\n|\r/g, ' ')
    str = str.replace(/\s+/g, ' ')
    const text = domInput.value
    // if (domInput.selectionStart == domInput.selectionEnd) {
    const newValue =
      text.substring(0, domInput.selectionStart) +
      str +
      text.substring(domInput.selectionEnd ?? domInput.selectionStart, text.length)
    domInput.value = newValue
    value = newValue
    // } else {
    //   clipboardWriteText(text.substring(domInput.selectionStart, domInput.selectionEnd))
    // }
  }

  if (autofocus) {
    onMount(() => {
      void tick().then(() => {
        domInput.focus()
      })
    })
  }
</script>

<input
  bind:this={domInput}
  class={['input', { min }]}
  {id}
  {type}
  {placeholder}
  {value}
  {disabled}
  {onkeydown}
  {onblur}
  tabindex="0"
  oninput={handleInput}
  onchange={() => {
    if (readonly) return
    onchange(domInput.value.trim())
  }}
  onkeyup={handleKeyup}
  oncontextmenu={handleContextMenu}
/>

<style lang="less">
  .input {
    display: inline-block;
    border: none;
    border-radius: @form-radius;
    padding: 7px 8px;
    color: var(--color-button-font);
    outline: none;
    transition: background-color 0.2s ease;
    background-color: var(--color-primary-background);
    font-size: 13.3px;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[disabled] {
      opacity: 0.4;
    }

    &:hover,
    &:focus {
      background-color: var(--color-primary-background-hover) !important;
    }
    &:active {
      background-color: var(--color-primary-background-active) !important;
    }
  }

  .min {
    padding: 3px 8px;
    font-size: 12px;
  }
</style>
