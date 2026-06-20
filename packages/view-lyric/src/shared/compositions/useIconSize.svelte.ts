// export const iconsize: Action<HTMLElement, { size: number,  , onUpdate: (size: string) => void }> = (parentDom, onupdate) => {
//   let iconSize = $state('32px')

//   let unsub = onDomSizeChanged(parentDom, (width, height) => {
//     onupdate(`${Math.trunc(width * size)}px`)
//   })

//   $effect(() => {
//     if (!parentDom) return
//     return onDomSizeChanged(parentDom, (width, height) => {
//       iconSize = `${Math.trunc(width * size)}px`
//     })
//   })

//   return {
//     destroy() {
//       unsub?.()
//     },
//   }
// }
