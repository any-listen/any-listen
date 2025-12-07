<script lang="ts">
  import { onMount } from 'svelte'

  let {
    value,
    step,
    min,
    max,
    disabled = false,
    deltaStep,
    onchange,
  }: {
    value: number
    min: number
    max: number
    step?: number
    disabled?: boolean
    deltaStep?: number
    onchange: (val: number) => void
  } = $props()

  const getDefaultStep = () => {
    const range = max - min
    return range === 0 ? 0 : range / 100
  }
  const getSlideStep = () => step ?? getDefaultStep()
  const getDeltaStep = () => deltaStep ?? step ?? getDefaultStep()
  const clamp = (val: number) => Math.min(max, Math.max(min, val))
  const snapToSlideStep = (val: number) => {
    const slideStep = getSlideStep()
    if (!slideStep) return clamp(val)
    const snapped = min + Math.round((val - min) / slideStep) * slideStep
    return clamp(snapped)
  }
  const countDecimals = (num: number) => {
    if (!isFinite(num) || num === 0) return 6
    const str = num.toString().toLowerCase()
    if (str.includes('e-')) {
      const [base, exp] = str.split('e-')
      const extra = Number(exp)
      return (base.split('.')[1]?.length ?? 0) + (Number.isFinite(extra) ? extra : 0)
    }
    return str.split('.')[1]?.length ?? 0
  }
  const formatValue = (val: number, refStep?: number) => {
    const decimals = countDecimals(refStep ?? getSlideStep())
    const precision = Math.min(8, Math.max(decimals, 6))
    return parseFloat(val.toFixed(precision))
  }
  const emitChange = (val: number, refStep?: number) => {
    onchange(formatValue(val, refStep))
  }

  const sliderEvent = {
    isMsDown: false,
    msDownX: 0,
    msDownValue: 0,
  }
  let domSliderBar: HTMLElement

  const handleDown = (clientX: number, offsetX: number) => {
    sliderEvent.isMsDown = true
    sliderEvent.msDownX = clientX

    sliderEvent.msDownValue = offsetX / domSliderBar.clientWidth
    const val = snapToSlideStep(sliderEvent.msDownValue * (max - min) + min)
    emitChange(val, getSlideStep())
  }
  const handleSliderMsUp = () => {
    sliderEvent.isMsDown = false
  }
  const handleMove = (clientX: number) => {
    const value = snapToSlideStep(
      (sliderEvent.msDownValue + (clientX - sliderEvent.msDownX) / domSliderBar.clientWidth) * (max - min) + min
    )
    emitChange(value, getSlideStep())
  }
  const handleWheel = (event: WheelEvent) => {
    const _step = getDeltaStep()
    let val = clamp(value - (event.deltaY / 100) * _step)
    emitChange(val, _step)
  }
  const handleKeydown = (event: KeyboardEvent) => {
    let _step = getDeltaStep()
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        _step = -_step
      // eslint-disable-next-line no-fallthrough
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        break
      default:
        return
    }
    const val = clamp(value + _step)
    emitChange(val, _step)
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (disabled) return
    handleDown(event.clientX, event.offsetX)
  }
  const handleTouchDown = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      if (disabled) return
      event.preventDefault()
      const touch = event.changedTouches[0]
      let offsetX = touch.clientX - (event.currentTarget as HTMLDivElement).getBoundingClientRect().left
      handleDown(touch.clientX, offsetX)
    }
  }
  const handleMouseMove = (event: MouseEvent) => {
    if (!sliderEvent.isMsDown || disabled) return
    handleMove(event.clientX)
  }
  const handleTouchMove = (event: TouchEvent) => {
    if (event.changedTouches.length) {
      if (!sliderEvent.isMsDown || disabled) return
      event.preventDefault()
      const touch = event.changedTouches[0]
      handleMove(touch.clientX)
    }
  }

  onMount(() => {
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleSliderMsUp)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleSliderMsUp)

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleSliderMsUp)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleSliderMsUp)
    }
  })
</script>

<div class="slider" class:disabled>
  <div class="slider-content">
    <div class="slider-bar" bind:this={domSliderBar} style:transform={`scaleX(${(value - min) / (max - min) || 0})`}></div>
  </div>
  <div
    class="slider-mask"
    role="slider"
    tabindex="0"
    aria-valuenow={value}
    aria-disabled={disabled}
    onwheel={handleWheel}
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchDown}
    onkeydown={handleKeydown}
  ></div>
</div>

<style lang="less">
  .slider {
    position: relative;
    // margin-right: 10px;
    display: flex;
    flex: none;
    align-items: center;
    width: 100px;
    padding: 5px 0;
    opacity: 0.5;
    transition: opacity @transition-normal;
    &:hover {
      opacity: 1;
    }
    &.disabled {
      opacity: 0.3;
      .slider-mask {
        cursor: default;
      }
    }
  }

  .slider-content {
    // background-color: #f5f5f5;
    position: relative;
    // cursor: pointer;
    width: 100%;
    height: 5px;
    overflow: hidden;
    background-color: var(--color-primary-alpha-700);
    border-radius: 20px;
    transition: @transition-normal;
    transition-property: background-color, opacity;
    // border-radius: @radius-progress-border;
  }

  // .muted {
  //   opacity: .5;
  // }

  .slider-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-button-font);
    box-shadow: 0 0 2px rgb(0 0 0 / 20%);
    transform: scaleX(0);
    transform-origin: 0;
    transition-timing-function: ease;
    // border-radius: @radius-progress-border;
    transition-duration: 0.2s;
    transition-property: transform;
  }

  .slider-mask {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
</style>
