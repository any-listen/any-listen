window.dt = /dt=true/.test(window.location.search)
const os = /os=(\w+)/.exec(window.location.search)?.[1]
document.documentElement.classList.add('desktop', os, window.dt ? 'disable-transparent' : 'transparent')
window.os = os
if (/&t=(.+)(#|$)/.test(window.location.search)) window.setTheme(JSON.parse(decodeURIComponent(RegExp.$1)))
