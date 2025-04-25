window.dt = /dt=true/.test(window.location.search)
document.documentElement.classList.add(window.dt ? 'disable-transparent' : 'transparent')
const os = /os=(\w+)/.exec(window.location.search)?.[1]
document.documentElement.classList.add(os)
window.os = os
if (/&t=(.+)(#|$)/.test(window.location.search)) window.setTheme(JSON.parse(decodeURIComponent(RegExp.$1)))
